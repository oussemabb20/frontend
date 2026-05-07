import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import GradientBorder from "examples/GradientBorder";
import { authService } from "../../../services/auth.service";
import { IoArrowBack, IoCheckmarkCircle, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

// Vision UI Dashboard React context
import { useVisionUIController, setDarkMode } from "context/index.jsx";

function ForgotPassword() {
  const navigate = useNavigate();
  const [controller, dispatchVisionUI] = useVisionUIController();
  
  // Step management
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code, 3: Success
  
  // Form data
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Force light mode on forgot-password page
  useEffect(() => {
    setDarkMode(dispatchVisionUI, false);
    
    return () => {
      const storedDarkMode = localStorage.getItem("bb-dark-mode");
      if (storedDarkMode === "true") {
        setDarkMode(dispatchVisionUI, true);
      }
    };
  }, [dispatchVisionUI]);

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  // Step 1: Request reset code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setStep(3);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Success screen
  if (step === 3) {
    return (
      <VuiBox
        component="main"
        role="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
        }}
      >
        <VuiBox sx={{ maxWidth: "450px", width: "100%", px: 3 }}>
          <GradientBorder borderRadius="20px" minHeight="auto">
            <VuiBox
              p={4}
              sx={{
                background: "rgb(19, 21, 54)",
                borderRadius: "20px",
                textAlign: "center",
              }}
            >
              <IoCheckmarkCircle size={80} color="#0075FF" />
              <VuiTypography variant="h1" color="white" fontWeight="bold" mt={2} mb={1} sx={{ fontSize: "1.875rem" }}>
                Password Reset!
              </VuiTypography>
              <VuiTypography variant="body2" color="text" mb={3}>
                Your password has been successfully reset.
                <br />
                Redirecting to sign in...
              </VuiTypography>
            </VuiBox>
          </GradientBorder>
        </VuiBox>
      </VuiBox>
    );
  }

  // Step 2: Enter reset code and new password
  if (step === 2) {
    return (
      <VuiBox
        component="main"
        role="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
        }}
      >
        <VuiBox sx={{ maxWidth: "450px", width: "100%", px: 3 }}>
          <VuiBox mb={3}>
            <VuiTypography variant="h1" color="white" fontWeight="bold" textAlign="center" sx={{ fontSize: "1.875rem" }}>
              Reset Password 🔑
            </VuiTypography>
            <VuiTypography variant="body2" color="text" textAlign="center" mt={1}>
              Enter the code sent to <strong>{email}</strong>
            </VuiTypography>
          </VuiBox>

          <GradientBorder borderRadius="20px" minHeight="auto">
            <VuiBox
              component="form"
              onSubmit={handleResetPassword}
              noValidate
              p={3}
              sx={{
                background: "rgb(19, 21, 54)",
                borderRadius: "20px",
              }}
            >
              {error && (
                <VuiBox
                  mb={2}
                  p={2}
                  sx={{
                    background: "rgba(255, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 0, 0, 0.3)",
                    borderRadius: "8px",
                  }}
                >
                  <VuiTypography variant="caption" color="error">
                    {error}
                  </VuiTypography>
                </VuiBox>
              )}

              <VuiBox mb={2}>
                <VuiBox mb={1} ml={0.5}>
                  <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
                    Reset Code
                  </VuiTypography>
                </VuiBox>
                <GradientBorder
                  minWidth="100%"
                  borderRadius="8px"
                  padding="1px"
                  backgroundImage="radial-gradient(69.43% 69.43% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)"
                >
                  <VuiInput
                    type="text"
                    placeholder="Enter 6-digit code..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    inputProps={{ required: false }}
                    maxLength={6}
                    sx={{ 
                      background: "rgb(19, 21, 54)", 
                      textAlign: "center", 
                      fontSize: "20px", 
                      letterSpacing: "5px" 
                    }}
                  />
                </GradientBorder>
              </VuiBox>

              <VuiBox mb={2}>
                <VuiBox mb={1} ml={0.5}>
                  <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
                    New Password
                  </VuiTypography>
                </VuiBox>
                <GradientBorder
                  minWidth="100%"
                  borderRadius="8px"
                  padding="1px"
                  backgroundImage="radial-gradient(69.43% 69.43% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)"
                >
                  <VuiBox display="flex" alignItems="center" position="relative">
                    <VuiInput
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      inputProps={{ required: false }}
                      sx={{ 
                        background: "rgb(19, 21, 54)",
                        paddingRight: "40px"
                      }}
                    />
                    <VuiBox
                      position="absolute"
                      right="10px"
                      display="flex"
                      alignItems="center"
                      sx={{ cursor: "pointer", zIndex: 10 }}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <IoEyeOffOutline size="20px" color="white" />
                      ) : (
                        <IoEyeOutline size="20px" color="white" />
                      )}
                    </VuiBox>
                  </VuiBox>
                </GradientBorder>
              </VuiBox>

              <VuiBox mb={2}>
                <VuiBox mb={1} ml={0.5}>
                  <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
                    Confirm Password
                  </VuiTypography>
                </VuiBox>
                <GradientBorder
                  minWidth="100%"
                  borderRadius="8px"
                  padding="1px"
                  backgroundImage="radial-gradient(69.43% 69.43% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)"
                >
                  <VuiBox display="flex" alignItems="center" position="relative">
                    <VuiInput
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      inputProps={{ required: false }}
                      sx={{ 
                        background: "rgb(19, 21, 54)",
                        paddingRight: "40px"
                      }}
                    />
                    <VuiBox
                      position="absolute"
                      right="10px"
                      display="flex"
                      alignItems="center"
                      sx={{ cursor: "pointer", zIndex: 10 }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <IoEyeOffOutline size="20px" color="white" />
                      ) : (
                        <IoEyeOutline size="20px" color="white" />
                      )}
                    </VuiBox>
                  </VuiBox>
                </GradientBorder>
              </VuiBox>

              <VuiBox mb={2}>
                <VuiTypography variant="caption" color="text">
                  Password must contain:
                </VuiTypography>
                <VuiTypography variant="caption" color="text" component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                </VuiTypography>
              </VuiBox>

              <VuiButton color="info" fullWidth type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </VuiButton>

              <VuiBox mt={3} textAlign="center">
                <VuiTypography
                  variant="button"
                  color="white"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setStep(1)}
                >
                  ← Back to email
                </VuiTypography>
              </VuiBox>
            </VuiBox>
          </GradientBorder>
        </VuiBox>
      </VuiBox>
    );
  }

  // Step 1: Enter email
  return (
    <VuiBox
      component="main"
      role="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)",
      }}
    >
      <VuiBox sx={{ maxWidth: "450px", width: "100%", px: 3 }}>
        <VuiBox mb={3}>
          <VuiTypography variant="h1" color="white" fontWeight="bold" textAlign="center" sx={{ fontSize: "1.875rem" }}>
            Forgot Password? 🔐
          </VuiTypography>
          <VuiTypography variant="body2" color="text" textAlign="center" mt={1}>
            Enter your email and we'll send you a reset code
          </VuiTypography>
        </VuiBox>

        <GradientBorder borderRadius="20px" minHeight="auto">
          <VuiBox
            component="form"
            onSubmit={handleRequestReset}
            noValidate
            p={3}
            sx={{
              background: "rgb(19, 21, 54)",
              borderRadius: "20px",
            }}
          >
            {error && (
              <VuiBox
                mb={2}
                p={2}
                sx={{
                  background: "rgba(255, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 0, 0, 0.3)",
                  borderRadius: "8px",
                }}
              >
                <VuiTypography variant="caption" color="error">
                  {error}
                </VuiTypography>
              </VuiBox>
            )}

            <VuiBox mb={2}>
              <VuiBox mb={1} ml={0.5}>
                <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
                  Email
                </VuiTypography>
              </VuiBox>
              <GradientBorder
                minWidth="100%"
                borderRadius="8px"
                padding="1px"
                backgroundImage="radial-gradient(69.43% 69.43% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)"
              >
                <VuiInput
                  type="email"
                  placeholder="Your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputProps={{ required: false }}
                  sx={{ background: "rgb(19, 21, 54)" }}
                />
              </GradientBorder>
            </VuiBox>

            <VuiButton color="info" fullWidth type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </VuiButton>

            <VuiBox mt={3} textAlign="center">
              <VuiTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="info"
                fontWeight="medium"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  "&:hover": {
                    color: "#0075FF",
                  },
                }}
              >
                <IoArrowBack /> Back to Sign In
              </VuiTypography>
            </VuiBox>
          </VuiBox>
        </GradientBorder>
      </VuiBox>
    </VuiBox>
  );
}

export default ForgotPassword;
