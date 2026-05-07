/*!

=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

// Icons
import { IoScanOutline, IoClose, IoQrCode } from "react-icons/io5";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiSwitch from "components/VuiSwitch";
import VuiButton from "components/VuiButton";
import VuiInput from "components/VuiInput";

// Examples
import GradientBorder from "examples/GradientBorder";
import radialGradient from "assets/theme/functions/radialGradient";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

// Face ID Component
import { FaceIdEnrollment } from "components/FaceId";

// Auth service
import { authService } from "../../../../services/auth.service";
import { useVisionUIController } from "context";

function PlatformSettings() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Face ID states
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [showFaceIdEnrollment, setShowFaceIdEnrollment] = useState(false);
  const [faceIdMessage, setFaceIdMessage] = useState("");

  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setup2FAModalOpen, setSetup2FAModalOpen] = useState(false);
  const [disable2FAModalOpen, setDisable2FAModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [twoFactorSuccess, setTwoFactorSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Check Face ID status on mount
  useEffect(() => {
    const checkFaceId = async () => {
      const user = authService.getCurrentUser();
      if (user?.email) {
        try {
          const enabled = await authService.checkFaceIdStatus(user.email);
          setFaceIdEnabled(enabled);
        } catch {
          setFaceIdEnabled(false);
        }
      }
    };
    checkFaceId();
  }, []);

  // Check 2FA status on mount
  useEffect(() => {
    const check2FA = async () => {
      try {
        const status = await authService.get2FAStatus();
        setTwoFactorEnabled(status.isEnabled);
      } catch (err) {
        console.error("Failed to fetch 2FA status:", err);
      }
    };
    check2FA();
  }, []);

  // 2FA handlers
  const handleGenerate2FA = async () => {
    setTwoFactorError("");
    setActionLoading(true);
    try {
      const data = await authService.generate2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetup2FAModalOpen(true);
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError("");
    setActionLoading(true);
    try {
      const data = await authService.enable2FA(verificationCode);
      setRecoveryCodes(data.recoveryCodes);
      setTwoFactorEnabled(true);
      setTwoFactorSuccess("2FA has been enabled successfully!");
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError("");
    setActionLoading(true);
    try {
      await authService.disable2FA(verificationCode);
      setTwoFactorEnabled(false);
      setDisable2FAModalOpen(false);
      setVerificationCode("");
      setTwoFactorSuccess("2FA has been disabled");
      setTimeout(() => setTwoFactorSuccess(""), 3000);
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSetup2FAModal = () => {
    setSetup2FAModalOpen(false);
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setRecoveryCodes([]);
    setTwoFactorError("");
  };

  const handleCloseDisable2FAModal = () => {
    setDisable2FAModalOpen(false);
    setVerificationCode("");
    setTwoFactorError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setTwoFactorSuccess("Copied to clipboard!");
    setTimeout(() => setTwoFactorSuccess(""), 2000);
  };

  const handleEnableFaceId = () => {
    setShowFaceIdEnrollment(true);
  };

  const handleFaceIdSuccess = () => {
    setFaceIdEnabled(true);
    setShowFaceIdEnrollment(false);
    setFaceIdMessage("Face ID enabled successfully!");
  };

  const handleDisableFaceId = async () => {
    try {
      await authService.disableFaceId();
      setFaceIdEnabled(false);
      setFaceIdMessage("Face ID disabled");
    } catch (err) {
      setFaceIdMessage(err.message || "Failed to disable Face ID");
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    setDeleting(true);

    try {
      const user = authService.getCurrentUser();
      console.log("Current user:", user);
      
      if (!user) {
        setError("No user found. Please log in again.");
        setDeleting(false);
        return;
      }
      
      const userId = user.id || user._id;
      if (!userId) {
        setError("User ID not found. Please log in again.");
        setDeleting(false);
        return;
      }
      
      console.log("Deleting user with ID:", userId);
      await authService.deleteAccount(userId);
      console.log("Account deleted successfully");
      navigate("/authentication/sign-in");
    } catch (err) {
      console.error("Delete account error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || err.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <Card sx={{ 
      minHeight: "490px", 
      height: "100%",
      background: darkMode
        ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
        : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)",
      backdropFilter: "blur(42px)",
      border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(148, 163, 184, 0.35)",
      borderRadius: "20px",
    }}>
      <VuiBox p={3}>
        <VuiBox mb="26px">
          <VuiTypography variant="lg" fontWeight="bold" color={darkMode ? "white" : "dark"} textTransform="capitalize">
            Platform Settings
          </VuiTypography>
        </VuiBox>
        <VuiBox lineHeight={1.25}>
        {/* Two-Factor Authentication Section */}
        <VuiBox mb="6px">
          <VuiTypography variant="xxs" fontWeight="medium" color="text" textTransform="uppercase">
            Security
          </VuiTypography>
        </VuiBox>
        <VuiBox display="flex" mb="14px">
          <VuiBox mt={0.25}>
            <VuiSwitch
              color="info"
              checked={twoFactorEnabled}
              inputProps={{
                'aria-labelledby': 'twofa-label',
                'aria-describedby': 'twofa-desc',
              }}
              onChange={() => {
                if (twoFactorEnabled) {
                  setDisable2FAModalOpen(true);
                } else {
                  handleGenerate2FA();
                }
              }}
            />
          </VuiBox>
          <VuiBox width="80%" ml={2}>
            <VuiTypography id="twofa-label" variant="button" fontWeight="regular" color="text">
              Two-Factor Authentication
            </VuiTypography>
            <VuiTypography id="twofa-desc" variant="caption" color="text" display="block">
              Add an extra layer of security with 2FA
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        {/* Face ID Section */}
        <VuiBox mt={2}>
          <VuiBox display="flex" alignItems="center" mb={2}>
            <IoScanOutline size="24px" color="#667eea" style={{ marginRight: "12px" }} />
            <VuiBox>
              <VuiTypography variant="button" fontWeight="medium" color={darkMode ? "white" : "dark"}>
                Face ID Login
              </VuiTypography>
              <VuiTypography variant="caption" color="text">
                {faceIdEnabled
                  ? "Face recognition is enabled for quick login"
                  : "Use your face to login quickly and securely"}
              </VuiTypography>
            </VuiBox>
          </VuiBox>

          {showFaceIdEnrollment ? (
            <FaceIdEnrollment
              onSuccess={handleFaceIdSuccess}
              onError={(msg) => setFaceIdMessage(msg || "Enrollment failed")}
            />
          ) : (
            <VuiButton
              fullWidth
              onClick={faceIdEnabled ? handleDisableFaceId : handleEnableFaceId}
              sx={{
                background: faceIdEnabled
                  ? "rgba(255, 0, 0, 0.1)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: faceIdEnabled ? "1px solid rgba(255, 0, 0, 0.3)" : "none",
                color: "white",
                "&:hover": {
                  background: faceIdEnabled
                    ? "rgba(255, 0, 0, 0.2)"
                    : "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                },
              }}
            >
              <IoScanOutline size="18px" style={{ marginRight: "8px" }} />
              {faceIdEnabled ? "Disable Face ID" : "Enable Face ID"}
            </VuiButton>
          )}
          {faceIdMessage && (
            <VuiTypography
              variant="caption"
              color={faceIdMessage.includes("success") || faceIdMessage.includes("enabled") ? "success" : "error"}
              mt={1}
            >
              {faceIdMessage}
            </VuiTypography>
          )}
        </VuiBox>

        {/* Delete Account Section */}
        <VuiBox mt={4} pt={3} borderTop="1px solid rgba(255, 255, 255, 0.1)">
          <VuiTypography variant="xxs" fontWeight="medium" color="text" textTransform="uppercase" mb={2}>
            Danger Zone
          </VuiTypography>
          <VuiButton
            color="error"
            fullWidth
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              background: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              "&:hover": {
                background: "rgba(255, 0, 0, 0.2)",
              },
            }}
          >
            Delete Account
          </VuiButton>
        </VuiBox>
      </VuiBox>
      </VuiBox>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: darkMode
              ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.9) 76.65%)"
              : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.99) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)",
            backdropFilter: "blur(42px)",
            border: darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.35)",
            borderRadius: "20px",
            padding: "20px",
          },
        }}
      >
        <DialogTitle>
          <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
            Delete Account
          </VuiTypography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <VuiBox mb={2}>
              <VuiTypography variant="caption" color="error" fontWeight="medium">
                {error}
              </VuiTypography>
            </VuiBox>
          )}
          <VuiTypography variant="body2" color="text">
            Are you sure you want to delete your account? This action cannot be undone.
            All your data, including statistics, achievements, and badges will be permanently deleted.
          </VuiTypography>
        </DialogContent>
        <DialogActions>
          <VuiButton
            color="secondary"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </VuiButton>
          <VuiButton
            color="error"
            onClick={handleDeleteAccount}
            disabled={deleting}
            sx={{
              background: "rgba(255, 0, 0, 0.2)",
              border: "1px solid rgba(255, 0, 0, 0.5)",
              "&:hover": {
                background: "rgba(255, 0, 0, 0.3)",
              },
            }}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </VuiButton>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog
        open={setup2FAModalOpen}
        onClose={handleCloseSetup2FAModal}
        maxWidth="sm"
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
          <VuiBox display="flex" alignItems="center" justifyContent="space-between">
            <VuiBox display="flex" alignItems="center">
              <IoQrCode size="24px" color="#0075FF" style={{ marginRight: "12px" }} />
              <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
                Enable 2FA
              </VuiTypography>
            </VuiBox>
            <IconButton onClick={handleCloseSetup2FAModal} aria-label="Close 2FA setup dialog">
              <IoClose size="24px" color={darkMode ? "white" : "#0f172a"} aria-hidden="true" />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        <DialogContent>
          {!recoveryCodes.length ? (
            <VuiBox component="form" onSubmit={handleEnable2FA}>
              {twoFactorError && (
                <VuiBox mb={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "8px" }}>
                  <VuiTypography variant="button" color="error" fontWeight="medium">
                    {twoFactorError}
                  </VuiTypography>
                </VuiBox>
              )}

              <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={2}>
                Step 1: Scan QR Code
              </VuiTypography>
              <VuiTypography variant="caption" color="text" fontWeight="regular" mb={2}>
                Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
              </VuiTypography>

              {qrCode && (
                <VuiBox display="flex" justifyContent="center" my={3}>
                  <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: "200px", borderRadius: "12px" }} />
                </VuiBox>
              )}

              <VuiTypography variant="caption" color="text" fontWeight="regular" mb={1}>
                Or enter this code manually:
              </VuiTypography>
              <VuiBox
                mb={3}
                p={2}
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => copyToClipboard(secret)}
              >
                <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium" sx={{ fontFamily: "monospace" }}>
                  {secret}
                </VuiTypography>
              </VuiBox>

              <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={2}>
                Step 2: Verify
              </VuiTypography>
              <VuiTypography variant="caption" color="text" fontWeight="regular" mb={2}>
                Enter the 6-digit code from your authenticator app:
              </VuiTypography>

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
                  id="setup-2fa-code"
                  type="text"
                  placeholder="000000"
                  aria-label="6-digit authenticator code"
                  aria-required="true"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  sx={{
                    fontSize: "20px",
                    textAlign: "center",
                    letterSpacing: "8px",
                  }}
                />
              </GradientBorder>

              <VuiBox mt={3}>
                <VuiButton
                  type="submit"
                  color="info"
                  fullWidth
                  disabled={actionLoading || verificationCode.length !== 6}
                >
                  {actionLoading ? "VERIFYING..." : "ENABLE 2FA"}
                </VuiButton>
              </VuiBox>
            </VuiBox>
          ) : (
            <VuiBox>
              <VuiTypography variant="h6" color="success" fontWeight="bold" mb={2}>
                ✓ 2FA Enabled Successfully!
              </VuiTypography>
              <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={2}>
                Recovery Codes
              </VuiTypography>
              <VuiTypography variant="caption" color="error" fontWeight="regular" mb={2}>
                ⚠️ Save these codes in a safe place. You won't see them again!
              </VuiTypography>

              <VuiBox
                my={2}
                p={2}
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {recoveryCodes.map((code, index) => (
                  <VuiTypography
                    key={index}
                    variant="button"
                    color={darkMode ? "white" : "dark"}
                    fontWeight="medium"
                    sx={{ fontFamily: "monospace", display: "block", mb: 1 }}
                  >
                    {code}
                  </VuiTypography>
                ))}
              </VuiBox>

              <VuiButton
                color="info"
                fullWidth
                onClick={() => copyToClipboard(recoveryCodes.join("\n"))}
                sx={{ mb: 2 }}
              >
                Copy All Codes
              </VuiButton>

              <VuiButton color="secondary" fullWidth onClick={handleCloseSetup2FAModal}>
                Done
              </VuiButton>
            </VuiBox>
          )}
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Modal */}
      <Dialog
        open={disable2FAModalOpen}
        onClose={handleCloseDisable2FAModal}
        maxWidth="xs"
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
          <VuiBox display="flex" alignItems="center" justifyContent="space-between">
            <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
              Disable 2FA
            </VuiTypography>
            <IconButton onClick={handleCloseDisable2FAModal} aria-label="Close disable 2FA dialog">
              <IoClose size="24px" color={darkMode ? "white" : "#0f172a"} aria-hidden="true" />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        <DialogContent>
          <VuiBox component="form" onSubmit={handleDisable2FA}>
            {twoFactorError && (
              <VuiBox mb={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "8px" }}>
                <VuiTypography variant="button" color="error" fontWeight="medium">
                  {twoFactorError}
                </VuiTypography>
              </VuiBox>
            )}

            <VuiTypography variant="button" color="text" fontWeight="regular" mb={2}>
              Enter your 6-digit 2FA code to disable two-factor authentication:
            </VuiTypography>

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
                id="disable-2fa-code"
                type="text"
                placeholder="000000"
                aria-label="6-digit authenticator code to disable 2FA"
                aria-required="true"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                sx={{
                  fontSize: "20px",
                  textAlign: "center",
                  letterSpacing: "8px",
                }}
              />
            </GradientBorder>

            <VuiBox mt={3} display="flex" gap={2}>
              <VuiButton color="secondary" fullWidth onClick={handleCloseDisable2FAModal}>
                Cancel
              </VuiButton>
              <VuiButton
                type="submit"
                color="error"
                fullWidth
                disabled={actionLoading || verificationCode.length !== 6}
              >
                {actionLoading ? "DISABLING..." : "DISABLE"}
              </VuiButton>
            </VuiBox>
          </VuiBox>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default PlatformSettings;
