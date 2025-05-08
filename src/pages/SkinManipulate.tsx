import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

interface SkinData {
  id: string;
  hero: string;
  name: string;
  type: string;
  role: string[];
  img1: string;
  img2: string;
  url: string;
}

const SkinManipulate: React.FC = () => {
  const [skins, setSkins] = useState<SkinData[]>([]);
  const [filteredSkins, setFilteredSkins] = useState<SkinData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editSkin, setEditSkin] = useState<SkinData | null>(null);
  const [formData, setFormData] = useState<SkinData>({
    id: "",
    hero: "",
    name: "",
    type: "Backup",
    role: [],
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

  const squadOptions = [
    "Fighter",
    "Tank",
    "Mage",
    "Marksman",
    "Assassin",
    "Support",
  ];

  const typeOptions = [
    "Backup",
    "Original",
    "Upgrade",
    "Custom Skin",
    "Painted Skin",
  ];

  // Fetch API token
  useEffect(() => {
    if (navigator.userAgent.includes("HeadlessChrome")) return;

    const fetchApiToken = async () => {
      try {
        const response = await axios.get("https://git.agungbot.my.id/");
        const { githubToken } = response.data;
        if (!githubToken) {
          throw new Error("GitHub token not found in API response");
        }
        setApiToken(githubToken);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to fetch API token: ${errorMessage}. Operations disabled.`);
        setApiToken(null);
      }
    };

    fetchApiToken();
  }, []);

  // Fetch skins using GitHub API
  useEffect(() => {
    if (!apiToken) return;

    const fetchSkins = async () => {
      try {
        const response = await axios.get(
          "https://api.github.com/repos/AgungDevlop/InjectorMl/contents/Skin.json",
          {
            headers: { Authorization: `Bearer ${apiToken}` },
          }
        );
        const content = atob(response.data.content);
        const skinsData = JSON.parse(content);
        if (!Array.isArray(skinsData)) {
          throw new Error("Skin.json is not a valid array");
        }
        setSkins(skinsData);
        setFilteredSkins(skinsData);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `${err.message} (Status: ${err.response?.status})`
            : "Unknown error";
        setError(`Failed to fetch skins: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkins();
  }, [apiToken]);

  // Filter skins based on search and filters
  useEffect(() => {
    const filtered = skins.filter((skin) => {
      const matchesSearch =
        skin.hero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.role.some((role) =>
          role.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesType = typeFilter ? skin.type === typeFilter : true;
      const matchesRole = roleFilter ? skin.role.includes(roleFilter) : true;
      return matchesSearch && matchesType && matchesRole;
    });
    setFilteredSkins(filtered);
  }, [searchQuery, typeFilter, roleFilter, skins]);

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle type filter change
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  // Handle role filter change
  const handleRoleChangeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  // Handle input changes in modal
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role changes in modal
  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let newRoles = [...prev.role];
      if (checked) {
        if (newRoles.length >= 2) {
          setError("You can select up to 2 roles only.");
          return prev;
        }
        newRoles = [...newRoles, value];
      } else {
        newRoles = newRoles.filter((role) => role !== value);
      }
      setError("");
      return { ...prev, role: newRoles };
    });
  };

  // Validate file
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

  // Handle file upload
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
      setError("File uploads are disabled due to missing API token.");
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
          err instanceof AxiosError
            ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
                err.response?.data
              )})`
            : "Unknown error";
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

  // Open edit modal
  const openEditModal = (skin: SkinData) => {
    setEditSkin(skin);
    setFormData(skin);
    setImg1File(null);
    setImg2File(null);
    setZipFile(null);
    setUploadProgress({ img1: 0, img2: 0, zip: 0 });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditSkin(null);
    setFormData({
      id: "",
      hero: "",
      name: "",
      type: "Backup",
      role: [],
      img1: "",
      img2: "",
      url: "",
    });
    setError("");
    setSuccess("");
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !editSkin) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (
      !formData.hero ||
      !formData.name ||
      formData.role.length === 0 ||
      !formData.img1 ||
      !formData.img2 ||
      !formData.url
    ) {
      setError("All fields are required!");
      setIsSubmitting(false);
      return;
    }

    if (!apiToken) {
      setError("Update is disabled due to missing API token.");
      setIsSubmitting(false);
      return;
    }

    const updatedSkin: SkinData = {
      ...formData,
      id: editSkin.id,
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
        throw fetchErr;
      }

      const updatedSkins = currentSkins.map((skin) =>
        skin.id === editSkin.id ? updatedSkin : skin
      );

      await axios.put(
        skinJsonUrl,
        {
          message: `Update skin: ${updatedSkin.name}`,
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

      setSkins(updatedSkins);
      setFilteredSkins(updatedSkins);
      setSuccess("Skin updated successfully!");
      closeModal();
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to update Skin.json: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (isSubmitting) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!apiToken) {
      setError("Delete is disabled due to missing API token.");
      setIsSubmitting(false);
      return;
    }

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
        throw fetchErr;
      }

      const updatedSkins = currentSkins.filter((skin) => skin.id !== id);

      await axios.put(
        skinJsonUrl,
        {
          message: `Delete skin with ID: ${id}`,
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

      setSkins(updatedSkins);
      setFilteredSkins(updatedSkins);
      setSuccess("Skin deleted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message} (Status: ${err.response?.status}, Data: ${JSON.stringify(
              err.response?.data
            )})`
          : "Unknown error";
      setError(`Failed to delete skin: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-6 sm:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        Manage Skins
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

      {/* Search and Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Hero, Name, or Role..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={typeFilter}
            onChange={handleTypeChange}
            className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            <option value="" className="bg-gray-900 text-blue-300">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type} className="bg-gray-900 text-blue-300">
                {type}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={handleRoleChangeFilter}
            className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            <option value="" className="bg-gray-900 text-blue-300">All Roles</option>
            {squadOptions.map((squad) => (
              <option key={squad} value={squad} className="bg-gray-900 text-blue-300">
                {squad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : filteredSkins.length === 0 ? (
        <p className="text-center text-blue-300">No skins found.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {filteredSkins.map((skin) => (
            <div
              key={skin.id}
              className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
              <div className="relative z-10 p-4">
                <h2 className="text-lg font-bold text-blue-300 mb-2">{skin.name}</h2>
                <p className="text-sm text-blue-400">Hero: {skin.hero}</p>
                <p className="text-sm text-blue-400">Type: {skin.type}</p>
                <p className="text-sm text-blue-400">Roles: {skin.role.join(", ")}</p>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => openEditModal(skin)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-300 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skin.id)}
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none p-6 sm:p-8 max-w-3xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
            <h2 className="text-2xl font-extrabold text-blue-400 mb-6 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)] relative z-10">
              Edit Skin
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
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
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
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
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]"
                  htmlFor="type"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="block w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {typeOptions.map((type) => (
                    <option key={type} value={type} className="bg-gray-900 text-blue-300">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  Roles
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {squadOptions.map((squad) => (
                    <label
                      key={squad}
                      className="flex items-center space-x-2 text-blue-300"
                    >
                      <input
                        type="checkbox"
                        value={squad}
                        checked={formData.role.includes(squad)}
                        onChange={handleRoleChange}
                        className="bg-gray-900/50 border border-blue-400 text-blue-400 focus:ring-2 focus:ring-blue-400 rounded disabled:opacity-50"
                        disabled={isSubmitting}
                      />
                      <span>{squad}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  Select up to 2 roles.
                </p>
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
                      ></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                      {uploadProgress.img1}%
                    </p>
                  </div>
                )}
                {formData.img1 && (
                  <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    Current: {formData.img1}
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
                      ></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                      {uploadProgress.img2}%
                    </p>
                  </div>
                )}
                {formData.img2 && (
                  <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    Current: {formData.img2}
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
                      ></div>
                    </div>
                    <p className="text-sm text-blue-400 mt-1 drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                      {uploadProgress.zip}%
                    </p>
                  </div>
                )}
                {formData.url && (
                  <p className="mt-2 text-sm text-blue-400 truncate drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    Current: {formData.url}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-3 px-4 rounded-xl text-sm sm:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Skin"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-700 hover:shadow-[0_0_10px_rgba(107,114,128,0.8)] transition-all duration-300 disabled:opacity-50"
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

export default SkinManipulate;
