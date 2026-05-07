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
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// @mui icons
import { FaGoogle, FaGithub } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline, IoScanOutline, IoSparkles } from "react-icons/io5";
import { keyframes, Box } from "@mui/material";

// Face ID Component
import { FaceIdLogin } from "components/FaceId";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import VuiSwitch from "components/VuiSwitch";
import GradientBorder from "examples/GradientBorder";

// Vision UI Dashboard assets
import radialGradient from "assets/theme/functions/radialGradient";
import palette from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Auth service
import { authService } from "../../../services/auth.service";
import { clanService } from "../../../services/clan.service";
import { setUser } from "../../../store/slices/userSlice";

// Vision UI Dashboard React context
import { useVisionUIController } from "context";

// Images
import bgSignIn from "assets/images/signInImage.png";

// Define animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const redirectToAdminDashboard = (navigateTo) => {
  navigateTo('/admin/dashboard');
};

// ============================================================================
// AUTO CLAN CREATION
// Creates a personal clan for the user if they don't have one yet
// ============================================================================
const createClanIfNotExists = async (userId, username) => {
  try {
    const existingClan = await clanService.getClanByUser(userId);
    if (existingClan) return; // already in a clan, do nothing

    // Create a personal clan named after the user
    await clanService.createClan({
      name: `${username}'s Clan`,
      userId,
    });
    console.log(`✅ Clan created for user: ${username}`);
  } catch (err) {
    // Non-blocking: clan creation failure should not block login
    console.warn("⚠️ Could not create clan for user:", err?.response?.data?.message || err.message);
  }
};

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [faceIdAvailable, setFaceIdAvailable] = useState(false);
  const [showFaceIdLogin, setShowFaceIdLogin] = useState(false);
  
  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Check for OAuth errors in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    if (errorParam === '2fa_not_supported_oauth') {
      setError('OAuth login (Google/GitHub) is not supported when 2FA is enabled. Please use email/password login or disable 2FA in your profile settings.');
    } else if (errorParam === 'admin_oauth_blocked') {
      setError('Admin accounts cannot log in with Google or GitHub. Please use your email and password.');
    }
    if (errorParam) {
      window.history.replaceState({}, '', '/authentication/sign-in');
    }
  }, []);

  // Clear tokens and prevent back navigation when sign-in page loads
  useEffect(() => {
    // Clear all authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear Redux state
    dispatch(setUser(null));
    
    // Prevent back navigation by replacing history state
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dispatch]);

  // Check if Face ID is enabled for the email
  useEffect(() => {
    const checkFaceId = async () => {
      if (email && email.includes("@")) {
        try {
          const available = await authService.checkFaceIdStatus(email);
          setFaceIdAvailable(available);
        } catch {
          setFaceIdAvailable(false);
        }
      } else {
        setFaceIdAvailable(false);
      }
    };

    const timeoutId = setTimeout(checkFaceId, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleFaceIdLogin = () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    setError("");
    setShowFaceIdLogin(true);
  };

  const handleFaceIdSuccess = async (result) => {
    const currentUser = authService.getCurrentUser();
    const resolvedRole = currentUser?.role || result?.user?.role;

    if (currentUser) {
      dispatch(
        setUser({
          id: currentUser.id || currentUser._id,
          username: currentUser.username,
          email: currentUser.email,
          role: currentUser.role,
          avatar: currentUser.profile?.avatar || currentUser.providerAvatar,
          rank: currentUser.statistics?.rank,
          points: currentUser.statistics?.totalPoints,
        }),
      );

      // Auto-create clan if user doesn't have one (non-blocking)
      if (resolvedRole !== 'admin') {
        await createClanIfNotExists(
          currentUser.id || currentUser._id,
          currentUser.username,
        );
      }
    }

    if (resolvedRole === 'admin') {
      redirectToAdminDashboard(navigate);
    } else {
      navigate("/dashboard");
    }
  };

  const handleFaceIdCancel = () => {
    setShowFaceIdLogin(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    
    // Validate fields
    let hasError = false;
    
    if (!email || !email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }
    
    if (!password || !password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }
    
    if (hasError) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      console.log('✅ Login response:', response);
      console.log('📦 Tokens saved - Access:', !!localStorage.getItem('accessToken'), 'Refresh:', !!localStorage.getItem('refreshToken'));
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setRequires2FA(true);
        setUserId(response.userId);
        setLoading(false);
        return;
      }
      
      const currentUser = authService.getCurrentUser();
      console.log('👤 Current user after login:', currentUser);
      const resolvedRole = currentUser?.role || response.user?.role;

      if (currentUser) {
        dispatch(
          setUser({
            id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            avatar: currentUser.profile?.avatar || currentUser.providerAvatar,
            rank: currentUser.statistics?.rank,
            points: currentUser.statistics?.totalPoints,
          }),
        );

        // Auto-create clan if user doesn't have one (non-blocking)
        if (resolvedRole !== 'admin') {
          await createClanIfNotExists(
            currentUser.id || currentUser._id,
            currentUser.username,
          );
        }
      }

      if (resolvedRole === 'admin') {
        redirectToAdminDashboard(navigate);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setTwoFactorLoading(true);

    try {
      const response2FA = await authService.loginWith2FA(userId, twoFactorCode);
      const currentUser = authService.getCurrentUser();
      const resolvedRole = currentUser?.role || response2FA.user?.role;

      if (currentUser) {
        dispatch(
          setUser({
            id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            avatar: currentUser.profile?.avatar || currentUser.providerAvatar,
            rank: currentUser.statistics?.rank,
            points: currentUser.statistics?.totalPoints,
          }),
        );

        // Auto-create clan if user doesn't have one (non-blocking)
        if (resolvedRole !== 'admin') {
          await createClanIfNotExists(
            currentUser.id || currentUser._id,
            currentUser.username,
          );
        }
      }

      if (resolvedRole === 'admin') {
        redirectToAdminDashboard(navigate);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      const errorMessage = err.response?.data?.message || "Invalid 2FA code. Please try again.";
      setError(errorMessage);
      setTwoFactorCode("");
      setRequires2FA(true);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleShowQRCode = async () => {
    setQrLoading(true);
    setError("");
    try {
      const response = await authService.get2FALoginQR(userId);
      setQrCodeData(response.qrCode);
      setShowQRCode(true);
    } catch (err) {
      console.error("Failed to load QR code:", err);
      setError("Failed to load QR code. Please try entering the code manually.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <CoverLayout
      title="Nice to see you!"
      color="white"
      description="Enter your email and password to sign in"
      premotto="COMPETE. CODE. CONQUER:"
      motto="BYTEBATTLE ARENA"
      image={bgSignIn}
    >
      <VuiBox 
        component="form" 
        role="form" 
        onSubmit={requires2FA ? handleVerify2FA : handleSubmit}
        noValidate
        sx={{
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        {error && (
          <VuiBox 
            mb={2} 
            p={2}
            sx={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "12px",
            }}
          >
            <VuiTypography variant="caption" color="error" fontWeight="medium">
              {error}
            </VuiTypography>
          </VuiBox>
        )}

        {requires2FA ? (
          <>
            <VuiBox mb={3} textAlign="center">
              <VuiTypography variant="h5" color="dark" fontWeight="bold" mb={1}>
                Two-Factor Authentication
              </VuiTypography>
              <VuiTypography variant="button" color="text" fontWeight="regular">
                {showQRCode ? "Scan the QR code with your authenticator app" : "Enter the 6-digit code from your authenticator app"}
              </VuiTypography>
            </VuiBox>

            {showQRCode && qrCodeData ? (
              <VuiBox mb={3} display="flex" justifyContent="center">
                <VuiBox
                  p={2}
                  sx={{
                    background: "white",
                    borderRadius: "12px",
                    display: "inline-block",
                  }}
                >
                  <img src={qrCodeData} alt="2FA QR Code" style={{ width: "200px", height: "200px", display: "block" }} />
                </VuiBox>
              </VuiBox>
            ) : null}

            <VuiBox mb={2}>
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
                  fontWeight="500"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  sx={{
                    fontSize: "24px",
                    textAlign: "center",
                    letterSpacing: "8px",
                  }}
                />
              </GradientBorder>
            </VuiBox>
            
            <VuiBox mt={2} mb={2} textAlign="center">
              <VuiTypography
                variant="caption"
                color="info"
                fontWeight="medium"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={showQRCode ? () => setShowQRCode(false) : handleShowQRCode}
              >
                {qrLoading ? "Loading..." : showQRCode ? "Hide QR code" : "Show QR code to scan"}
              </VuiTypography>
            </VuiBox>

            <VuiBox mt={4} mb={1}>
              <VuiButton type="submit" color="info" fullWidth disabled={twoFactorLoading || twoFactorCode.length !== 6}>
                {twoFactorLoading ? "VERIFYING..." : "VERIFY CODE"}
              </VuiButton>
            </VuiBox>
            <VuiBox mt={2} textAlign="center">
              <VuiTypography
                variant="button"
                color="text"
                fontWeight="regular"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFactorCode("");
                  setError("");
                  setShowQRCode(false);
                  setQrCodeData("");
                }}
              >
                ← Back to login
              </VuiTypography>
            </VuiBox>
          </>
        ) : (
          <>
            <VuiBox mb={2}>
              <VuiBox mb={1} ml={0.5}>
                <VuiTypography component="label" variant="button" color="dark" fontWeight="medium">
                  Email
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
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": { filter: "brightness(1.2)" },
                  "&:focus-within": {
                    filter: "brightness(1.3)",
                    boxShadow: "0 0 20px rgba(0, 117, 255, 0.3)",
                  },
                }}
              >
                <VuiInput
                  type="email"
                  placeholder="Your email..."
                  fontWeight="500"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  inputProps={{ required: false }}
                />
              </GradientBorder>
              {emailError && (
                <VuiBox mt={0.5} ml={0.5}>
                  <VuiTypography variant="caption" color="error" fontWeight="medium">
                    {emailError}
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
            <VuiBox mb={2}>
              <VuiBox mb={1} ml={0.5}>
                <VuiTypography component="label" variant="button" color="dark" fontWeight="medium">
                  Password
                </VuiTypography>
              </VuiBox>
              <GradientBorder
                minWidth="100%"
                borderRadius={borders.borderRadius.lg}
                padding="1px"
                backgroundImage={radialGradient(
                  palette.gradients.borderLight.main,
                  palette.gradients.borderLight.state,
                  palette.gradients.borderLight.angle
                )}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": { filter: "brightness(1.2)" },
                  "&:focus-within": {
                    filter: "brightness(1.3)",
                    boxShadow: "0 0 20px rgba(0, 117, 255, 0.3)",
                  },
                }}
              >
                <VuiBox display="flex" alignItems="center" position="relative">
                  <VuiInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    inputProps={{ required: false }}
                    sx={({ typography: { size } }) => ({
                      fontSize: size.sm,
                      paddingRight: "40px",
                    })}
                  />
                  <VuiBox
                    position="absolute"
                    right="10px"
                    display="flex"
                    alignItems="center"
                    sx={{ 
                      cursor: "pointer", 
                      zIndex: 10,
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size="20px" color="#1a202c" />
                    ) : (
                      <IoEyeOutline size="20px" color="#1a202c" />
                    )}
                  </VuiBox>
                </VuiBox>
              </GradientBorder>
              {passwordError && (
                <VuiBox mt={0.5} ml={0.5}>
                  <VuiTypography variant="caption" color="error" fontWeight="medium">
                    {passwordError}
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
            <VuiBox display="flex" alignItems="center">
              <VuiSwitch 
                color="info" 
                checked={rememberMe} 
                onChange={handleSetRememberMe}
                inputProps={{ "aria-label": "Remember me" }}
              />
              <VuiTypography
                variant="caption"
                color="dark"
                fontWeight="medium"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none" }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;Remember me
              </VuiTypography>
            </VuiBox>
            <VuiBox mt={2} textAlign="right">
              <VuiTypography
                component={Link}
                to="/authentication/forgot-password"
                variant="button"
                color="info"
                fontWeight="medium"
                sx={{ "&:hover": { color: "#0075FF" } }}
              >
                Forgot password?
              </VuiTypography>
            </VuiBox>
            <VuiBox mt={4} mb={1}>
              <VuiButton 
                type="submit" 
                color="info" 
                fullWidth 
                disabled={loading}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  padding: "14px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover:not(:disabled)": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0, 117, 255, 0.4)",
                  },
                  "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    animation: loading ? `${shimmer} 1.5s infinite` : "none",
                  },
                }}
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </VuiButton>
            </VuiBox>

            {faceIdAvailable && !showFaceIdLogin && (
              <VuiBox mb={1}>
                <VuiButton
                  onClick={handleFaceIdLogin}
                  fullWidth
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    transition: "all 0.3s ease",
                    padding: "12px",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    },
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    animation: `${float} 2s ease-in-out infinite`,
                  }}>
                    <IoScanOutline size="20px" style={{ marginRight: "10px" }} />
                    LOGIN WITH FACE ID
                  </Box>
                </VuiButton>
              </VuiBox>
            )}

            {showFaceIdLogin && (
              <VuiBox mb={2}>
                <FaceIdLogin
                  email={email}
                  onSuccess={handleFaceIdSuccess}
                  onCancel={handleFaceIdCancel}
                />
              </VuiBox>
            )}

            <VuiBox mt={3} mb={2} display="flex" alignItems="center">
              <VuiBox flex={1} height="1px" sx={{ background: "rgba(0, 0, 0, 0.1)" }} />
              <VuiTypography variant="button" color="text" fontWeight="regular" mx={2}>
                OR
              </VuiTypography>
              <VuiBox flex={1} height="1px" sx={{ background: "rgba(0, 0, 0, 0.1)" }} />
            </VuiBox>

            <VuiBox mb={2}>
              <VuiButton
                type="button"
                onClick={handleGoogleLogin}
                fullWidth
                sx={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#1f2937",
                  transition: "all 0.3s ease",
                  padding: "12px",
                  "&:hover": {
                    background: "#e5e7eb",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(66, 133, 244, 0.3)",
                    borderColor: "rgba(66, 133, 244, 0.5)",
                  },
                }}
              >
                <FaGoogle size="18px" style={{ marginRight: "10px" }} />
                Continue with Google
              </VuiButton>
            </VuiBox>

            <VuiBox mb={2}>
              <VuiButton
                type="button"
                onClick={handleGithubLogin}
                fullWidth
                sx={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#1f2937",
                  transition: "all 0.3s ease",
                  padding: "12px",
                  "&:hover": {
                    background: "#e5e7eb",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(36, 41, 46, 0.4)",
                    borderColor: "rgba(36, 41, 46, 0.6)",
                  },
                }}
              >
                <FaGithub size="18px" style={{ marginRight: "10px" }} />
                Continue with GitHub
              </VuiButton>
            </VuiBox>

            <VuiBox mt={4} textAlign="center">
              <VuiTypography variant="button" color="text" fontWeight="regular">
                Don't have an account?{" "}
                <VuiTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="bold"
                >
                  Sign up
                </VuiTypography>
              </VuiTypography>
            </VuiBox>
          </>
        )}
      </VuiBox>
    </CoverLayout>
  );
}

export default SignIn;
