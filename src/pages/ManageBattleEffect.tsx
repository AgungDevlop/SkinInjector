import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

interface EffectData {
  id: string;
  name: string;
  img1: string;
  img2: string;
  url: string;
}

const effectTypes = ["Recall", "Spawn", "Battle Emote", "Elimination"];

const ManageBattleEffect: React.FC = () => {
  const [effects, setEffects] = useState<{ [key: string]: EffectData[] }>({});
  const [filteredEffects, setFilteredEffects] = useState<{ [key: string]: EffectData[] }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editEffect, setEditEffect] = useState<EffectData | null>(null);
  const [editType, setEditType] = useState<string>("");
  const [formData, setFormData] = useState<EffectData>({
    id: "",
    name: "",
    img1: "",
    img2: "",
    url: "",
  });
  const [img1File, setImg1File] = useState<File | null>(null);
  const [img2File, setImg2File] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({
    img1: 0,
    img2: 0,
    zip: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (navigator.userAgent.includes("HeadlessChrome")) return;

    const fetchApiToken = async () => {
      try {
        const response = await axios.get("https://git.agungbot.my.id/");
        const { githubToken } = response.data;
        if (!githubToken) throw new Error("GitHub token not found");
        setApiToken(githubToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch API token: ${errorMessage}`);
        setApiToken(null);
      }
    };
    fetchApiToken();
  }, []);

  useEffect(() => {
    if (!apiToken) return;

    const fetchEffects = async () => {
      try {
        const effectsData: { [key: string]: EffectData[] } = {};
        for (const type of effectTypes) {
          const jsonFileName = `${type.replace(" ", "")}.json`;
          const response = await axios.get(
            `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${jsonFileName}`,
            { headers: { Authorization: `Bearer ${apiToken}` } }
          );
          const content = atob(response.data.content);
          effectsData[type] = JSON.parse(content);
        }
        setEffects(effectsData);
        setFilteredEffects(effectsData);
      } catch (err) {
        const errorMessage = err instanceof AxiosError ? err.message : "Unknown error";
        setError(`Failed to fetch effects: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEffects();
  }, [apiToken]);

  useEffect(() => {
    const filtered: { [key: string]: EffectData[] } = {};
    for (const type of effectTypes) {
      const typeEffects = effects[type] || [];
      filtered[type] = typeEffects.filter((effect) =>
        effect.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (typeFilter && typeFilter !== type) filtered[type] = [];
    }
    setFilteredEffects(filtered);
  }, [searchQuery, typeFilter, effects]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File, type: "img1" | "img2" | "zip"): boolean => {
    const validImageExtensions = ["jpg", "jpeg", "png", "gif"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (type === "zip" && extension !== "zip") {
      setError("Please select a .zip file for Zip File.");
      return false;
    }
    if ((type === "img1" || type === "img2") && !validImageExtensions.includes(extension)) {
      setError(`Please select an image file for ${type === "img1" ? "Image 1" : "Image 2"}.`);
      return false;
    }
    return true;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: "img1" | "img2" | "zip") => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, type)) return;
    if (file.size > 100 * 1024 * 1024) {
      setError(`File size exceeds 100MB for ${type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"}.`);
      return;
    }
    if (!apiToken) {
      setError("File uploads disabled due to missing API token.");
      return;
    }

    if (type === "img1") setImg1File(file);
    else if (type === "img2") setImg2File(file);
    else setZipFile(file);

    const randomId = uuidv4().slice(0, 8);
    const extension = file.name.split(".").pop() ?? "";
    const newFileName = `${file.name.replace(`.${extension}`, "")}_${randomId}.${extension}`;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Content = (reader.result as string).split(",")[1];
      const folder = type === "img1" ? "img1" : type === "img2" ? "img2" : editType.replace(" ", "");
      const uploadUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${folder}/${newFileName}`;

      try {
        const response = await axios.put(
          uploadUrl,
          { message: `Upload ${newFileName}`, content: base64Content },
          {
            headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              setUploadProgress((prev) => ({ ...prev, [type]: percentCompleted }));
            },
          }
        );
        setFormData((prev) => ({ ...prev, [type === "zip" ? "url" : type]: response.data.content.download_url }));
      } catch (err) {
        const errorMessage = err instanceof AxiosError ? err.message : "Unknown error";
        setError(`Failed to upload ${type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"}: ${errorMessage}`);
      }
    };
  };

  const openEditModal = (effect: EffectData, type: string) => {
    setEditEffect(effect);
    setEditType(type);
    setFormData(effect);
    setImg1File(null);
    setImg2File(null);
    setZipFile(null);
    setUploadProgress({ img1: 0, img2: 0, zip: 0 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditEffect(null);
    setEditType("");
    setFormData({ id: "", name: "", img1: "", img2: "", url: "" });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !editEffect || !editType) return;
    setIsSubmitting(true);

    if (!formData.name || !formData.img1 || !formData.img2 || !formData.url) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    const updatedEffect: EffectData = { ...formData, id: editEffect.id };
    const jsonFileName = `${editType.replace(" ", "")}.json`;
    const effectJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${jsonFileName}`;

    try {
      const response = await axios.get(effectJsonUrl, { headers: { Authorization: `Bearer ${apiToken}` } });
      const currentEffects: EffectData[] = JSON.parse(atob(response.data.content));
      const sha = response.data.sha;
      const updatedEffects = currentEffects.map((effect) => (effect.id === editEffect.id ? updatedEffect : effect));

      await axios.put(
        effectJsonUrl,
        { message: `Update ${editType}: ${updatedEffect.name}`, content: btoa(JSON.stringify(updatedEffects, null, 2)), sha },
        { headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" } }
      );

      setEffects((prev) => ({ ...prev, [editType]: updatedEffects }));
      setFilteredEffects((prev) => ({ ...prev, [editType]: updatedEffects }));
      setSuccess(`${editType} updated successfully!`);
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? err.message : "Unknown error";
      setError(`Failed to update ${jsonFileName}: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const jsonFileName = `${type.replace(" ", "")}.json`;
    const effectJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${jsonFileName}`;

    try {
      const response = await axios.get(effectJsonUrl, { headers: { Authorization: `Bearer ${apiToken}` } });
      const currentEffects: EffectData[] = JSON.parse(atob(response.data.content));
      const sha = response.data.sha;
      const updatedEffects = currentEffects.filter((effect) => effect.id !== id);

      await axios.put(
        effectJsonUrl,
        { message: `Delete ${type}: ${id}`, content: btoa(JSON.stringify(updatedEffects, null, 2)), sha },
        { headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" } }
      );

      setEffects((prev) => ({ ...prev, [type]: updatedEffects }));
      setFilteredEffects((prev) => ({ ...prev, [type]: updatedEffects }));
      setSuccess(`${type} deleted successfully!`);
    } catch (err) {
      const errorMessage = err instanceof AxiosError ? err.message : "Unknown error";
      setError(`Failed to delete ${type}: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-6 sm:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        Manage Battle Effects
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg text-sm backdrop-blur-sm border border-red-400/50 animate-neon-pulse">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-blue-900/60 text-blue-200 rounded-lg text-sm backdrop-blur-sm border border-blue-400/50 animate-neon-pulse">
          {success}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Effect Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <select
          value={typeFilter}
          onChange={handleTypeChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        >
          <option value="">All Types</option>
          {effectTypes.map((type) => (
            <option key={type} value={type} className="bg-gray-900 text-blue-300">
              {type}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        effectTypes.map((type) => (
          <div key={type} className="mb-8">
            <h2 className="text-xl font-bold text-blue-400 mb-4">{type}</h2>
            {filteredEffects[type]?.length === 0 ? (
              <p className="text-center text-blue-300">No {type.toLowerCase()} found.</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                {filteredEffects[type].map((effect) => (
                  <div
                    key={effect.id}
                    className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
                    <div className="relative z-10 p-4">
                      <h3 className="text-lg font-bold text-blue-300 mb-2">{effect.name}</h3>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => openEditModal(effect, type)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(effect.id, type)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 hover:shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-300 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none p-6 sm:p-8 max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
            <h2 className="text-2xl font-extrabold text-blue-400 mb-6 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] relative z-10">
              Edit {editType}
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]" htmlFor="name">
                  Effect Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]" htmlFor="img1">
                  Image 1
                </label>
                <input
                  id="img1"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "img1")}
                  className="block w-full text-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-blue-400 file:text-sm file:font-semibold file:bg-gray-900/50 file:text-blue-300 hover:file:bg-blue-950 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                {img1File && <p className="mt-2 text-sm text-blue-400 truncate">Selected: {img1File.name}</p>}
                {uploadProgress.img1 > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                      <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse" style={{ width: `${uploadProgress.img1}%` }}></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1">{uploadProgress.img1}%</p>
                  </div>
                )}
                {formData.img1 && <p className="mt-2 text-sm text-blue-400 truncate">Current: {formData.img1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]" htmlFor="img2">
                  Image 2
                </label>
                <input
                  id="img2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "img2")}
                  className="block w-full text-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-blue-400 file:text-sm file:font-semibold file:bg-gray-900/50 file:text-blue-300 hover:file:bg-blue-950 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                {img2File && <p className="mt-2 text-sm text-blue-400 truncate">Selected: {img2File.name}</p>}
                {uploadProgress.img2 > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                      <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse" style={{ width: `${uploadProgress.img2}%` }}></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1">{uploadProgress.img2}%</p>
                  </div>
                )}
                {formData.img2 && <p className="mt-2 text-sm text-blue-400 truncate">Current: {formData.img2}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]" htmlFor="zip">
                  Zip File
                </label>
                <input
                  id="zip"
                  type="file"
                  accept=".zip"
                  onChange={(e) => handleFileChange(e, "zip")}
                  className="block w-full text-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-blue-400 file:text-sm file:font-semibold file:bg-gray-900/50 file:text-blue-300 hover:file:bg-blue-950 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                {zipFile && <p className="mt-2 text-sm text-blue-400 truncate">Selected: {zipFile.name}</p>}
                {uploadProgress.zip > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                      <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse" style={{ width: `${uploadProgress.zip}%` }}></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1">{uploadProgress.zip}%</p>
                  </div>
                )}
                {formData.url && <p className="mt-2 text-sm text-blue-400 truncate">Current: {formData.url}</p>}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Effect"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 hover:shadow-[0_0_10px_rgba(107,114,128,0.8)] transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBattleEffect;
