import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

interface HeroData {
  id: string;
  her: string;
  roll: string;
  URL: string | null;
}

const roleTypes = ["Assassin", "Tank", "Fighter", "Mage", "Marksman", "Support"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const PanelHero: React.FC = () => {
  const [formData, setFormData] = useState<HeroData>({
    id: "",
    her: "",
    roll: "Assassin",
    URL: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!formData.her || !formData.roll || !formData.URL) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    if (!apiToken) {
      setError("Submission is disabled due to missing GitHub API token.");
      setIsSubmitting(false);
      return;
    }

    const newHero: HeroData = {
      id: uuidv4().slice(0, 10),
      her: formData.her,
      roll: formData.roll,
      URL: formData.URL,
    };

    const heroJsonUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Hero.json`;

    try {
      let currentHeroes: HeroData[] = [];
      let sha: string | undefined;
      try {
        const response = await axios.get<{ content: string; sha: string }>(heroJsonUrl, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (response.data.content) {
          currentHeroes = JSON.parse(atob(response.data.content));
          if (!Array.isArray(currentHeroes)) {
            throw new Error("Hero.json is not a valid array");
          }
          sha = response.data.sha;
        }
      } catch (fetchErr) {
        if (axios.isAxiosError(fetchErr) && fetchErr.response?.status === 404) {
          currentHeroes = [];
        } else {
          throw fetchErr;
        }
      }

      const updatedHeroes = [...currentHeroes, newHero];

      await axios.put(
        heroJsonUrl,
        {
          message: `Add new hero ID ${newHero.id}: ${newHero.her}`,
          content: btoa(JSON.stringify(updatedHeroes, null, 2)),
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
        her: "",
        roll: "Assassin",
        URL: null,
      });
      setImageFile(null);
      setUploadProgress(0);
      setSuccess("Hero added successfully!");
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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-6 sm:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] relative z-10">
        Add New Hero
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
              Uploaded: {formData.URL}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Add Hero"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/ManageHero")}
          className="w-full mt-4 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
        >
          Manage Heroes
        </button>
      </form>
    </div>
  );
};

export default PanelHero;