import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

interface EffectData {
  id: string;
  name: string;
  img1: string | null;
  img2: string | null;
  url: string | null;
}

const effectTypes = ["Recall", "Spawn", "Battle Emote", "Elimination"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const GITHUB_UPLOAD_THRESHOLD = 25 * 1024 * 1024; // 25MB
const API_TOKEN = "AgungDeveloper";

const PanelBattleEffect: React.FC = () => {
  const [formData, setFormData] = useState<EffectData>({
    id: "",
    name: "",
    img1: null,
    img2: null,
    url: null,
  });
  const [effectType, setEffectType] = useState<string>("Recall");
  const [img1File, setImg1File] = useState<File | null>(null);
  const [img2File, setImg2File] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({
    img1: 0,
    img2: 0,
    zip: 0,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.userAgent.includes("HeadlessChrome")) return;

    const fetchApiToken = async (): Promise<void> => {
      try {
        const response = await axios.get<{ githubToken: string }>("https://skinml.agungbot.my.id");
        const { githubToken } = response.data;
        if (!githubToken) {
          throw new Error("GitHub token not found in API response");
        }
        setApiToken(githubToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch API token: ${errorMessage}. File uploads are disabled.`);
        setApiToken(null);
      }
    };

    fetchApiToken();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEffectTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setEffectType(e.target.value);
  };

  const validateFile = (file: File, type: "img1" | "img2" | "zip"): boolean => {
    const validImageExtensions = ["jpg", "jpeg", "png", "gif"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (type === "zip" && extension !== "zip") {
      setError(`Please select a .zip file for Zip File.`);
      return false;
    }
    if (
      (type === "img1" || type === "img2") &&
      !validImageExtensions.includes(extension)
    ) {
      setError(
        `Please select an image file (jpg, jpeg, png, gif) for ${
          type === "img1" ? "Image 1" : "Image 2"
        }.`
      );
      return false;
    }
    return true;
  };

  const uploadToGitHub = async (
    type: "img1" | "img2" | "zip",
    newFileName: string,
    base64Content: string
  ): Promise<string | null> => {
    const folder = type === "img1" ? "img1" : type === "img2" ? "img2" : effectType.replace(" ", "");
    const uploadUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${folder}/${newFileName}`;

    try {
      const response = await axios.put<{ content: { download_url: string } }>(
        uploadUrl,
        {
          message: `Upload ${newFileName} to ${folder}`,
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
            setUploadProgress((prev) => ({ ...prev, [type]: percentCompleted }));
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
      setError(
        `Failed to upload ${
          type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"
        } to GitHub: ${errorMessage}`
      );
      return null;
    }
  };

  const uploadToCustomApi = async (
    file: File,
    type: "img1" | "img2" | "zip"
  ): Promise<string | null> => {
    if (!file.name.match(/\.zip$/i)) {
      setError(`Invalid file format for ${type}. Only zip files are allowed.`);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prev) => ({ ...prev, [type]: percentComplete }));
      }
    });

    xhr.open("POST", "https://skinml.agungbot.my.id/api.php", true);
    xhr.setRequestHeader("Authorization", `Bearer ${API_TOKEN}`);

    return new Promise((resolve) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.url) {
              setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
              resolve(response.url);
            } else {
              setError(`Failed to get file URL from API for ${type}.`);
              resolve(null);
            }
          } catch (parseError) {
            setError(`Invalid response from API for ${type}.`);
            resolve(null);
          }
        } else {
          setError(`Failed to upload ${type} to API: ${xhr.statusText || "Unknown error"}`);
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setError(`Network error while uploading ${type} to API. Please check your connection or server status.`);
        resolve(null);
      };

      xhr.send(formData);
    });
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "img1" | "img2" | "zip"
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, type)) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size exceeds 100MB limit for ${
          type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"
        }.`
      );
      return;
    }

    if (!apiToken && type !== "zip") {
      setError("File uploads are disabled due to missing GitHub API token.");
      return;
    }

    if (type === "img1") setImg1File(file);
    else if (type === "img2") setImg2File(file);
    else setZipFile(file);

    const randomId = uuidv4().slice(0, 8);
    const extension = file.name.split(".").pop() ?? "";
    const newFileName = `${file.name.replace(`.${extension}`, "")}_${randomId}.${extension}`;

    let fileUrl: string | null = null;

    if (type === "zip" && file.size > GITHUB_UPLOAD_THRESHOLD) {
      // Upload zip files > 25MB to custom API
      fileUrl = await uploadToCustomApi(file, type);
    } else {
      // Upload to GitHub for files <= 25MB or images
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

        fileUrl = await uploadToGitHub(type, newFileName, base64Content);
        if (fileUrl) {
          setFormData((prev) => ({
            ...prev,
            [type === "zip" ? "url" : type]: fileUrl,
          }));
          setError("");
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
      };
      return; // Avoid setting formData until reader.onload completes
    }

    if (fileUrl) {
      setFormData((prev) => ({
        ...prev,
        [type === "zip" ? "url" : type]: fileUrl,
      }));
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.img1 ||
      !formData.img2 ||
      !formData.url ||
      !effectType
    ) {
      setError("All fields and effect type are required!");
      setIsSubmitting(false);
      return;
    }

    if (!apiToken) {
      setError("Submission is disabled due to missing GitHub API token.");
      setIsSubmitting(false);
      return;
    }

    const { id, ...formDataWithoutId } = formData;
    const newEffect: EffectData = {
      id: uuidv4().slice(0, 10),
      ...formDataWithoutId,
    };

    const jsonFileName = `${effectType.replace(" ", "")}.json`;
    const effectJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${jsonFileName}`;

    try {
      let currentEffects: EffectData[] = [];
      let sha: string | undefined;
      try {
        const response = await axios.get<{ content: string; sha: string }>(effectJsonUrl, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (response.data.content) {
          currentEffects = JSON.parse(atob(response.data.content));
          if (!Array.isArray(currentEffects)) {
            throw new Error(`${jsonFileName} is not a valid array`);
          }
          sha = response.data.sha;
        }
      } catch (fetchErr) {
        if (axios.isAxiosError(fetchErr) && fetchErr.response?.status === 404) {
          currentEffects = [];
        } else {
          throw fetchErr;
        }
      }

      const updatedEffects = [...currentEffects, newEffect];

      await axios.put(
        effectJsonUrl,
        {
          message: `Add new ${effectType.toLowerCase()}: ${newEffect.name}`,
          content: btoa(JSON.stringify(updatedEffects, null, 2)),
          sha,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFormData({
        id: "",
        name: "",
        img1: null,
        img2: null,
        url: null,
      });
      setImg1File(null);
      setImg2File(null);
      setZipFile(null);
      setUploadProgress({ img1: 0, img2: 0, zip: 0 });
      setSuccess(`${effectType} added successfully!`);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to update ${jsonFileName}: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-6 sm:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] relative z-10">
        Add New Battle Effect
      </h1>
      {error && (
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg text-sm backdrop-blur-sm border border-red-400/50 animate-neon-pulse relative z-10">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-blue-900/60 text-blue-200 rounded-lg text-sm backdrop-blur-sm border border-blue-400/50 animate-neon-pulse relative z-10">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label
            className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
            htmlFor="effectType"
          >
            Effect Type
          </label>
          <select
            id="effectType"
            value={effectType}
            onChange={handleEffectTypeChange}
            className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {effectTypes.map((type) => (
              <option key={type} value={type} className="bg-gray-900 text-blue-300">
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
            htmlFor="name"
          >
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
          <label
            className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
            htmlFor="img1"
          >
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
          <p className="text-xs text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
            Accepted formats: jpg, jpeg, png, gif. Max size: 100MB
          </p>
          {img1File && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Selected: {img1File.name}
            </p>
          )}
          {uploadProgress.img1 > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                <div
                  className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse"
                  style={{ width: `${uploadProgress.img1}%` }}
                />
              </div>
              <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                {uploadProgress.img1}%
              </p>
            </div>
          )}
          {formData.img1 && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Uploaded: {formData.img1}
            </p>
          )}
        </div>
        <div>
          <label
            className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
            htmlFor="img2"
          >
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
          <p className="text-xs text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
            Accepted formats: jpg, jpeg, png, gif. Max size: 100MB
          </p>
          {img2File && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Selected: {img2File.name}
            </p>
          )}
          {uploadProgress.img2 > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                <div
                  className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse"
                  style={{ width: `${uploadProgress.img2}%` }}
                />
              </div>
              <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                {uploadProgress.img2}%
              </p>
            </div>
          )}
          {formData.img2 && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Uploaded: {formData.img2}
            </p>
          )}
        </div>
        <div>
          <label
            className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
            htmlFor="zip"
          >
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
          <p className="text-xs text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
            Accepted format: zip. Max size: 100MB
          </p>
          {zipFile && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Selected: {zipFile.name}
            </p>
          )}
          {uploadProgress.zip > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-900/50 rounded-full h-2.5 overflow-hidden border border-blue-400/50">
                <div
                  className="bg-blue-400 h-2.5 rounded-full transition-all duration-300 animate-neon-pulse"
                  style={{ width: `${uploadProgress.zip}%` }}
                />
              </div>
              <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                {uploadProgress.zip}%
              </p>
            </div>
          )}
          {formData.url && (
            <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
              Uploaded: {formData.url}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : `Add ${effectType}`}
        </button>
        <button
          type="button"
          onClick={() => navigate("/ManageBattleEffect")}
          className="w-full mt-4 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
        >
          Manage Battle Effect
        </button>
      </form>
    </div>
  );
};

export default PanelBattleEffect;
