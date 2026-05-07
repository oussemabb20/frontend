import { useState, useEffect } from "react";
import { Card, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { IoClose, IoShieldCheckmark, IoQrCode } from "react-icons/io5";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import VuiInput from "components/VuiInput";
import VuiSwitch from "components/VuiSwitch";
import GradientBorder from "examples/GradientBorder";
import radialGradient from "assets/theme/functions/radialGradient";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import { authService } from "../../../../services/auth.service";
import { useVisionUIController } from "context";

function TwoFactorSettings() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const status = await authService.get2FAStatus();
      setIsEnabled(status.isEnabled);
    } catch (err) {
      console.error("Failed to fetch 2FA status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setError("");
    setActionLoading(true);
    try {
      const data = await authService.generate2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const data = await authService.enable2FA(verificationCode);
      setRecoveryCodes(data.recoveryCodes);
      setIsEnabled(true);
      setSuccess("2FA has been enabled successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      await authService.disable2FA(verificationCode);
      setIsEnabled(false);
      setDisableModalOpen(false);
      setVerificationCode("");
      setSuccess("2FA has been disabled");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSetupModal = () => {
    setSetupModalOpen(false);
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setRecoveryCodes([]);
    setError("");
  };

  const handleCloseDisableModal = () => {
    setDisableModalOpen(false);
    setVerificationCode("");
    setError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <Card
        sx={{
          background: darkMode
            ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
            : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)",
          backdropFilter: "blur(42px)",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(148, 163, 184, 0.35)",
          borderRadius: "20px",
          p: 3,
        }}
      >
        <VuiBox display="flex" alignItems="center" mb={2}>
          <IoShieldCheckmark size="24px" color="#0075FF" style={{ marginRight: "12px" }} />
          <VuiTypography variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold">
            Two-Factor Authentication
          </VuiTypography>
        </VuiBox>

        <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="regular" mb={3}>
          Add an extra layer of security to your account by enabling 2FA with an authenticator app.
        </VuiTypography>

        {success && (
          <VuiBox mb={2} p={2} sx={{ background: "rgba(0, 200, 83, 0.1)", borderRadius: "8px" }}>
            <VuiTypography variant="button" color="success" fontWeight="medium">
              ✓ {success}
            </VuiTypography>
          </VuiBox>
        )}

        <VuiBox display="flex" alignItems="center" justifyContent="space-between" mt={3}>
          <VuiBox display="flex" alignItems="center">
            <VuiSwitch
              color="info"
              checked={isEnabled}
              onChange={() => {
                if (isEnabled) {
                  setDisableModalOpen(true);
                } else {
                  handleGenerateQR();
                }
              }}
            />
            <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="medium" ml={2}>
              {isEnabled ? "Enabled" : "Disabled"}
            </VuiTypography>
          </VuiBox>

          {isEnabled && (
            <VuiTypography
              variant="caption"
              color="success"
              fontWeight="bold"
              sx={{
                background: "rgba(0, 200, 83, 0.1)",
                padding: "4px 12px",
                borderRadius: "8px",
              }}
            >
              ✓ ACTIVE
            </VuiTypography>
          )}
        </VuiBox>
      </Card>

      {/* Setup Modal */}
      <Dialog
        open={setupModalOpen}
        onClose={handleCloseSetupModal}
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
            <IconButton onClick={handleCloseSetupModal} aria-label="Close setup modal">
              <IoClose size="24px" color={darkMode ? "white" : "#0f172a"} />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        <DialogContent>
          {!recoveryCodes.length ? (
            <VuiBox component="form" onSubmit={handleEnable2FA}>
              {error && (
                <VuiBox mb={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "8px" }}>
                  <VuiTypography variant="button" color="error" fontWeight="medium">
                    {error}
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
                  type="text"
                  placeholder="000000"
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

              <VuiButton color="secondary" fullWidth onClick={handleCloseSetupModal}>
                Done
              </VuiButton>
            </VuiBox>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Modal */}
      <Dialog
        open={disableModalOpen}
        onClose={handleCloseDisableModal}
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
            <IconButton onClick={handleCloseDisableModal} aria-label="Close disable 2FA modal">
              <IoClose size="24px" color={darkMode ? "white" : "#0f172a"} />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        <DialogContent>
          <VuiBox component="form" onSubmit={handleDisable2FA}>
            {error && (
              <VuiBox mb={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "8px" }}>
                <VuiTypography variant="button" color="error" fontWeight="medium">
                  {error}
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
                type="text"
                placeholder="000000"
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
              <VuiButton color="secondary" fullWidth onClick={handleCloseDisableModal}>
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
    </>
  );
}

export default TwoFactorSettings;
