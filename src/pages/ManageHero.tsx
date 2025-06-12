import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

interface HeroData {
  id: string;
  her: string;
  roll: string;
  URL: string | null;
}

const roleTypes = ["Assassin", "Tank", "Fighter", "Mage", "Marksman", "Support"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ManageHero: React.FC = () => {
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<HeroData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editHero, setEditHero] = useState<HeroData | null>(null);
  const [formData, setFormData] = useState<HeroData>({
    id: "",
    her: "",
    roll: "Assassin",
    URL: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (navigator.userAgent.includes("HeadlessChrome")) return;

    const fetchApiToken = async (): Promise<void> => {
      try {
        const response = await axios.get<{ githubToken: string }>("https://skinml.agungbot.my.id");
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

    const fetchHeroes = async (): Promise<void> => {
      try {
        const response = await axios.get<{ content: string; sha: string }>(
          `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Hero.json`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        const content = atob(response.data.content);
        const heroesData = JSON.parse(content);
        setHeroes(heroesData);
        setFilteredHeroes(heroesData);
      } catch (err) {
        const errorMessage = err instanceof AxiosError ? err.message : "Unknown error";
        setError(`Failed to fetch heroes: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroes();
  }, [apiToken]);

  useEffect(() => {
    const filtered = heroes.filter((hero) => {
      const matchesSearch = hero.her.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || hero.roll.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
    setFilteredHeroes(filtered);
  }, [searchQuery, roleFilter, heroes]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRoleFilter(e.target.value);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): boolean => {
    const validImageExtensions = ["jpg", "jpeg", "png", "gif"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!validImageExtensions.includes(extension)) {
      setError("Please select an image file (jpg, jpeg, png, gif) for Hero Image.");
      return false;
    }
    return true;
  };

  const uploadToGitHub = async (
    newFileName: string,
    base64Content: string
  ): Promise<string | null> => {
    const uploadUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/hero_images/${newFileName}`;

    try {
      const response = await axios.put<{ content: { download_url: string } }>(
        uploadUrl,
        {
          message: `Upload ${newFileName} to hero_images`,
          content: base64Content,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? 1;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      return response.data.content.download_url;
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to upload Hero Image to GitHub: ${errorMessage}`);
      return null;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 100MB limit for Hero Image.");
      return;
    }

    if (!apiToken) {
      setError("File uploads are disabled due to missing GitHub API token.");
      return;
    }

    setImageFile(file);
    const randomId = uuidv4().slice(0, 8);
    const extension = file.name.split(".").pop() ?? "";
    const newFileName = `${file.name.replace(`.${extension}`, "")}_${randomId}.${extension}`;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        setError("Failed to read file content.");
        return;
      }
      const base64Content = reader.result.split(",")[1];
      if (!base64Content) {
        setError("Failed to read file content.");
        return;
      }

      const fileUrl = await uploadToGitHub(newFileName, base64Content);
      if (fileUrl) {
        setFormData((prev) => ({ ...prev, URL: fileUrl }));
        setError("");
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
  };

  const openEditModal = (hero: HeroData): void => {
    setEditHero(hero);
    setFormData(hero);
    setImageFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditHero(null);
    setFormData({ id: "", her: "", roll: "Assassin", URL: null });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting || !editHero) return;
    setIsSubmitting(true);

    if (!formData.her || !formData.roll || !formData.URL) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    const updatedHero: HeroData = { ...formData, id: editHero.id };
    const heroJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Hero.json`;

    try {
      const response = await axios.get<{ content: string; sha: string }>(heroJsonUrl, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const currentHeroes: HeroData[] = JSON.parse(atob(response.data.content));
      const sha = response.data.sha;
      const updatedHeroes = currentHeroes.map((hero) =>
        hero.id === editHero.id ? updatedHero : hero
      );

      await axios.put(
        heroJsonUrl,
        {
          message: `Update hero ID ${editHero.id}: ${updatedHero.her}`,
          content: btoa(JSON.stringify(updatedHeroes, null, 2)),
          sha,
        },
        {
          headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
        }
      );

      setHeroes(updatedHeroes);
      setFilteredHeroes((prev) =>
        prev.map((hero) => (hero.id === editHero.id ? updatedHero : hero))
      );
      setSuccess(`Hero updated successfully!`);
      closeModal();
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to update Hero.json: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const heroJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Hero.json`;

    try {
      const response = await axios.get<{ content: string; sha: string }>(heroJsonUrl, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const currentHeroes: HeroData[] = JSON.parse(atob(response.data.content));
      const sha = response.data.sha;
      const updatedHeroes = currentHeroes.filter((hero) => hero.id !== id);

      await axios.put(
        heroJsonUrl,
        {
          message: `Delete hero ID: ${id}`,
          content: btoa(JSON.stringify(updatedHeroes, null, 2)),
          sha,
        },
        {
          headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
        }
      );

      setHeroes(updatedHeroes);
      setFilteredHeroes(updatedHeroes);
      setSuccess(`Hero deleted successfully!`);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to delete hero: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-6 sm:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        Manage Heroes
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
          placeholder="Search by Hero Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <select
          value={roleFilter}
          onChange={handleRoleChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        >
          <option value="">All Roles</option>
          {roleTypes.map((role) => (
            <option key={role} value={role} className="bg-gray-900 text-blue-300">
              {role}
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
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Heroes</h2>
          {filteredHeroes.length === 0 ? (
            <p className="text-center text-blue-300">No heroes found.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
              {filteredHeroes.map((hero) => (
                <div
                  key={hero.id}
                  className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
                  <div className="relative z-10 p-4">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">{hero.her}</h3>
                    <p className="text-sm text-blue-400 mb-2">{hero.roll}</p>
                    {hero.URL && (
                      <img
                        src={hero.URL}
                        alt={hero.her}
                        className="w-full h-32 object-cover mb-4 rounded-lg border-2 border-blue-600"
                      />
                    )}
                    <div className="flex space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={() => openEditModal(hero)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(hero.id)}
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none p-6 sm:p-8 max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
            <h2 className="text-2xl font-extrabold text-blue-400 mb-6 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] relative z-10">
              Edit Hero
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
                  htmlFor="her"
                >
                  Hero Name
                </label>
                <input
                  id="her"
                  type="text"
                  name="her"
                  value={formData.her}
                  onChange={handleInputChange}
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
                  htmlFor="roll"
                >
                  Role
                </label>
                <select
                  id="roll"
                  name="roll"
                  value={formData.roll}
                  onChange={handleInputChange}
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {roleTypes.map((role) => (
                    <option key={role} value={role} className="bg-gray-900 text-blue-300">
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
                  htmlFor="image"
                >
                  Hero Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-blue-400 file:text-sm file:font-semibold file:bg-gray-900/50 file:text-blue-300 hover:file:bg-blue-950 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  Accepted formats: jpg, jpeg, png, gif. Max size: 100MB
                </p>
                {imageFile && (
                  <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    Selected: {imageFile.name}
                  </p>
                )}
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                      <div
                        className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
                {formData.URL && (
                  <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    Current: {formData.URL}
                  </p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Hero"}
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

export default ManageHero;