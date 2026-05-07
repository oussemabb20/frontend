import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, Grid, Avatar, IconButton } from "@mui/material";
import { IoCloudUpload, IoClose } from "react-icons/io5";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import GradientBorder from "examples/GradientBorder";
import radialGradient from "assets/theme/functions/radialGradient";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import apiClient from "../../../../services/api";
import { authService } from "../../../../services/auth.service";
import { useVisionUIController } from "context";

function EditProfileModal({ open, onClose, user, onUpdate }) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
    preferredLanguages: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.profile?.bio || user.bio || "",
        avatar: user.profile?.avatar || user.avatar || "",
        preferredLanguages: user.profile?.preferredLanguages?.join(", ") || user.preferredLanguages?.join(", ") || "",
      });
      setAvatarPreview(user.profile?.avatar || user.avatar || "");
    }
  }, [user, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({
          ...formData,
          avatar: reader.result, // Store base64 for now
        });
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData({
      ...formData,
      avatar: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Check if user has valid ID
      const userId = user?.id || user?._id;
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const updateData = {
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
        preferredLanguages: formData.preferredLanguages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang),
      };

      await apiClient.patch(`/users/${userId}`, updateData);
      
      // Update user in localStorage
      const updatedUser = {
        ...user,
        username: updateData.username,
        profile: {
          ...user.profile,
          bio: updateData.bio,
          avatar: updateData.avatar,
          preferredLanguages: updateData.preferredLanguages,
        },
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onUpdate(updatedUser);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: darkMode
            ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.94) 76.65%)"
            : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.99) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)",
          backdropFilter: "blur(42px)",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.35)",
          borderRadius: "20px",
        },
      }}
    >
      <DialogTitle>
        <VuiTypography variant="h4" color={darkMode ? "white" : "dark"} fontWeight="bold">
          Edit Profile
        </VuiTypography>
      </DialogTitle>
      <DialogContent>
        <VuiBox component="form" role="form" onSubmit={handleSubmit}>
          {error && (
            <VuiBox mb={2}>
              <VuiTypography variant="caption" color="error" fontWeight="medium">
                {error}
              </VuiTypography>
            </VuiBox>
          )}
          {success && (
            <VuiBox mb={2}>
              <VuiTypography variant="caption" color="success" fontWeight="medium">
                {success}
              </VuiTypography>
            </VuiBox>
          )}

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium">
                Username
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              padding="1px"
              borderRadius={borders.borderRadius.lg}
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="username"
                type="text"
                placeholder="Your username..."
                fontWeight="500"
                value={formData.username}
                onChange={handleChange}
              />
            </GradientBorder>
          </VuiBox>

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium">
                Bio
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              padding="1px"
              borderRadius={borders.borderRadius.lg}
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="bio"
                multiline
                rows={3}
                placeholder="Tell us about yourself..."
                fontWeight="500"
                value={formData.bio}
                onChange={handleChange}
              />
            </GradientBorder>
          </VuiBox>

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium">
                Avatar Image
              </VuiTypography>
            </VuiBox>
            
            {/* Avatar Preview and Upload */}
            <VuiBox 
              display="flex" 
              alignItems="center" 
              gap={2}
              p={2}
              sx={{
                background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
                borderRadius: borders.borderRadius.lg,
                border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(148, 163, 184, 0.35)",
              }}
            >
              {/* Avatar Preview */}
              <Avatar
                src={avatarPreview}
                alt="Avatar Preview"
                sx={{
                  width: 80,
                  height: 80,
                  border: darkMode ? "2px solid rgba(255, 255, 255, 0.2)" : "2px solid rgba(148, 163, 184, 0.35)",
                }}
              />

              {/* Upload Controls */}
              <VuiBox flex={1}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                <VuiBox display="flex" gap={1}>
                  <VuiButton
                    color="info"
                    size="small"
                    onClick={handleUploadClick}
                    sx={{ minWidth: "120px" }}
                  >
                    <IoCloudUpload size="16px" style={{ marginRight: "8px" }} />
                    UPLOAD
                  </VuiButton>
                  
                  {avatarPreview && (
                    <IconButton
                      aria-label="Remove avatar"
                      onClick={handleRemoveAvatar}
                      size="small"
                      sx={{
                        color: "error.main",
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 0, 0, 0.2)",
                        },
                      }}
                    >
                      <IoClose size="20px" />
                    </IconButton>
                  )}
                </VuiBox>

                <VuiTypography variant="caption" color="text" mt={1}>
                  Upload an image from your PC (max 5MB)
                </VuiTypography>
              </VuiBox>
            </VuiBox>
          </VuiBox>

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium">
                Preferred Languages (comma separated)
              </VuiTypography>
            </VuiBox>
            <GradientBorder
              minWidth="100%"
              padding="1px"
              borderRadius={borders.borderRadius.lg}
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiInput
                name="preferredLanguages"
                type="text"
                placeholder="JavaScript, Python, TypeScript"
                fontWeight="500"
                value={formData.preferredLanguages}
                onChange={handleChange}
              />
            </GradientBorder>
          </VuiBox>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <VuiButton color="secondary" fullWidth onClick={onClose}>
                CANCEL
              </VuiButton>
            </Grid>
            <Grid item xs={6}>
              <VuiButton type="submit" color="info" fullWidth disabled={loading}>
                {loading ? "SAVING..." : "SAVE CHANGES"}
              </VuiButton>
            </Grid>
          </Grid>
        </VuiBox>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileModal;
