import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

interface SkinData {
  id: string;
  hero: string;
  name: string;
  type: string;
  squad: string;
  img1: string;
  img2: string;
  url: string;
}

interface ApiConfig {
  githubToken: string;
}


const PanelAdmin: React.FC = () => {
  const [formData, setFormData] = useState<SkinData>({
    id: "",
    hero: "",
    name: "",
    type: "Backup",
    squad: "",
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
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const squadOptions = [
    "No Squad",
    "Starlight",
    "Saber",
    "VENOM",
    "LIGHTBORN",
    "Dragon Tamer",
    "Aspirants",
    "ALLSTAR",
    "M-World",
    "Metro Zero",
    "F.O.R.C.E.",
    "Blazing West",
    "N.E.X.T.",
    "Oriental Fighters",
    "Constellation Heroes",
    "Zodiac",
  ];

  const typeOptions = [
    "Backup",
    "Original",
    "Upgrade",
    "Custom Skin",
    "Painted Skin",
  ];

  // **Security Warning**: Storing the GitHub token (even encoded) in a public /api.json file
  // is insecure and can be decoded by anyone. Move to a secure backend with environment variables.
  useEffect(() => {
    // Skip API token fetch during react-snap pre-rendering
    if (navigator.userAgent.includes("HeadlessChrome")) return;

    const fetchApiToken = async () => {
      try {
        const response = await fetch("/api.json");
        if (!response.ok) {
          throw new Error(`Failed to load api.json: ${response.statusText}`);
        }
        const data: ApiConfig = await response.json();
        if (!data.githubToken) {
          throw new Error("GitHub token is missing in API response");
        }
        // Decode the Base64-encoded token
        let decodedToken: string;
        try {
          decodedToken = atob(data.githubToken);
        } catch (decodeErr) {
          throw new Error("Failed to decode GitHub token: Invalid Base64 string");
        }
        setApiToken(decodedToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load API configuration: ${errorMessage}. File uploads are disabled.`);
        setApiToken(null);
      }
    };
    fetchApiToken();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "img1" | "img2" | "zip"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, type)) return;

    if (file.size > 100 * 1024 * 1024) {
      setError(
        `File size exceeds 100MB limit for ${
          type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"
        }.`
      );
      return;
    }

    if (!apiToken) {
      setError("GitHub API token is missing. File uploads are disabled.");
      return;
    }

    if (type === "img1") setImg1File(file);
    else if (type === "img2") setImg2File(file);
    else setZipFile(file);

    const randomId = uuidv4().slice(0, 8);
    const extension = file.name.split(".").pop() ?? "";
    const newFileName = `${file.name.replace(
      `.${extension}`,
      ""
    )}_${randomId}.${extension}`;

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

      const folder = type === "img1" ? "img1" : type === "img2" ? "img2" : "Skin";
      const uploadUrl = `https://api.github.com/repos/AgungDevlop/InjectorMl/contents/${folder}/${newFileName}`;

      try {
        const response = await axios.put(
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
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / total
              );
              setUploadProgress((prev) => ({ ...prev, [type]: percentCompleted }));
            },
          }
        );

        const rawUrl = response.data.content.download_url;
        setFormData((prev) => ({
          ...prev,
          [type === "zip" ? "url" : type]: rawUrl,
        }));
        setError("");
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError ? err.message : "Unknown error";
        setError(
          `Failed to upload ${
            type === "img1" ? "Image 1" : type === "img2" ? "Image 2" : "Zip File"
          }: ${errorMessage}`
        );
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
    };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (
      !formData.hero ||
      !formData.name ||
      !formData.squad ||
      !formData.img1 ||
      !formData.img2 ||
      !formData.url
    ) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    if (!apiToken) {
      setError("GitHub API token is missing. Skin submission is disabled.");
      setIsSubmitting(false);
      return;
    }

    const { id, ...formDataWithoutId } = formData; // Exclude id from formData
    const newSkin: SkinData = {
      id: uuidv4().slice(0, 10),
      ...formDataWithoutId,
    };

    const skinJsonUrl =
      "https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Skin.json";

    try {
      let currentSkins: SkinData[] = [];
      let sha: string | undefined;
      try {
        const response = await axios.get(skinJsonUrl, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (response.data.content) {
          currentSkins = JSON.parse(atob(response.data.content));
          if (!Array.isArray(currentSkins)) {
            throw new Error("Skin.json is not a valid array");
          }
          sha = response.data.sha;
        }
      } catch (fetchErr) {
        if (axios.isAxiosError(fetchErr) && fetchErr.response?.status === 404) {
          currentSkins = [];
        } else {
          throw fetchErr;
        }
      }

      const updatedSkins = [...currentSkins, newSkin];

      await axios.put(
        skinJsonUrl,
        {
          message: `Add new skin: ${newSkin.name}`,
          content: btoa(JSON.stringify(updatedSkins, null, 2)),
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
        hero: "",
        name: "",
        type: "Backup",
        squad: "",
        img1: "",
        img2: "",
        url: "",
      });
      setImg1File(null);
      setImg2File(null);
      setZipFile(null);
      setUploadProgress({ img1: 0, img2: 0, zip: 0 });
      setSuccess("Skin added successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError ? err.message : "Unknown error";
      setError(`Failed to update Skin.json: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 border-2 border-blue-400 opacity-20 rounded-2xl animate-pulse-slow pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold text-blue-100 mb-8 tracking-tighter relative z-10">
          Add New Skin
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-900/80 text-red-100 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-blue-900/80 text-blue-100 rounded-lg text-sm backdrop-blur-sm relative z-10">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="hero"
            >
              Hero Name
            </label>
            <input
              id="hero"
              type="text"
              name="hero"
              value={formData.hero}
              onChange={handleInputChange}
              className="block w-full bg-blue-800/50 border-blue-600 text-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="name"
            >
              Skin Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full bg-blue-800/50 border-blue-600 text-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="type"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="block w-full bg-blue-800/50 border-blue-600 text-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              disabled={isSubmitting}
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="squad"
            >
              Squad
            </label>
            <select
              id="squad"
              name="squad"
              value={formData.squad}
              onChange={handleInputChange}
              className="block w-full bg-blue-800/50 border-blue-600 text-blue-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              required
              disabled={isSubmitting}
            >
              <option value="">Select Squad</option>
              {squadOptions.map((squad) => (
                <option key={squad} value={squad}>
                  {squad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="img1"
            >
              Image 1
            </label>
            <input
              id="img1"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "img1")}
              className="block w-full text-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-blue-100 hover:file:bg-blue-600 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300"
              disabled={isSubmitting}
            />
            <p className="text-xs text-blue-300 mt-1">
              Accepted formats: jpg, jpeg, png, gif. Max size: 100MB
            </p>
            {img1File && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Selected: {img1File.name}
              </p>
            )}
            {uploadProgress.img1 > 0 && (
              <div className="mt-4">
                <div className="w-full bg-blue-800/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.img1}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-300 mt-1">{uploadProgress.img1}%</p>
              </div>
            )}
            {formData.img1 && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Uploaded: {formData.img1}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="img2"
            >
              Image 2
            </label>
            <input
              id="img2"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "img2")}
              className="block w-full text-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-blue-100 hover:file:bg-blue-600 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300"
              disabled={isSubmitting}
            />
            <p className="text-xs text-blue-300 mt-1">
              Accepted formats: jpg, jpeg, png, gif. Max size: 100MB
            </p>
            {img2File && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Selected: {img2File.name}
              </p>
            )}
            {uploadProgress.img2 > 0 && (
              <div className="mt-4">
                <div className="w-full bg-blue-800/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.img2}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-300 mt-1">{uploadProgress.img2}%</p>
              </div>
            )}
            {formData.img2 && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Uploaded: {formData.img2}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-blue-200 mb-2"
              htmlFor="zip"
            >
              Zip File
            </label>
            <input
              id="zip"
              type="file"
              accept=".zip"
              onChange={(e) => handleFileChange(e, "zip")}
              className="block w-full text-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-blue-100 hover:file:bg-blue-600 hover:file:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-300"
              disabled={isSubmitting}
            />
            <p className="text-xs text-blue-300 mt-1">
              Accepted format: zip. Max size: 100MB
            </p>
            {zipFile && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Selected: {zipFile.name}
              </p>
            )}
            {uploadProgress.zip > 0 && (
              <div className="mt-4">
                <div className="w-full bg-blue-800/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.zip}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-300 mt-1">{uploadProgress.zip}%</p>
              </div>
            )}
            {formData.url && (
              <p className="mt-2 text-sm text-blue-300 truncate">
                Uploaded: {formData.url}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-blue-100 py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Skin"}
          </button>
        </form>
      </div>
    </>
  );
};

export default PanelAdmin;