import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

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

// Images
import bgSignUp from "assets/images/signUpImage.png";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      await authService.register(formData);
      setSuccess("Registration successful! Please check your email for verification code.");
      setShowVerification(true);
    } catch (err) {
      console.error("Registration error:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setShowVerification(true);
        setSuccess("Account already exists. If you just signed up, use the verification code sent to your email or resend it.");
        setError("");
      } else if (err.code === "ECONNABORTED") {
        setError("Request timed out. If this was your first attempt, your account may already be created. Try verification or login.");
      } else {
        setError(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.verifyEmail({
        email: formData.email,
        code: verificationCode,
      });
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Verification failed. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.resendVerification(formData.email);
      setSuccess("Verification code resent! Please check your email.");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OAUTH HANDLERS
  // ============================================================================

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleGithubSignUp = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <CoverLayout
      title="Welcome!"
      color="white"
      description={showVerification ? "Enter the verification code sent to your email" : "Create your ByteBattle account"}
      premotto="COMPETE. CODE. CONQUER:"
      motto="BYTEBATTLE ARENA"
      image={bgSignUp}
    >
      {!showVerification ? (
        <VuiBox component="form" role="form" onSubmit={handleRegister} noValidate>
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
              <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
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
                inputProps={{ required: false }}
              />
            </GradientBorder>
          </VuiBox>

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
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
            >
              <VuiInput
                name="email"
                type="email"
                placeholder="Your email..."
                fontWeight="500"
                value={formData.email}
                onChange={handleChange}
                inputProps={{ required: false }}
              />
            </GradientBorder>
          </VuiBox>

          <VuiBox mb={2}>
            <VuiBox mb={1} ml={0.5}>
              <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
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
            >
              <VuiBox display="flex" alignItems="center" position="relative">
                <VuiInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password..."
                  value={formData.password}
                  onChange={handleChange}
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
                  sx={{ cursor: "pointer", zIndex: 10 }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
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
              borderRadius={borders.borderRadius.lg}
              padding="1px"
              backgroundImage={radialGradient(
                palette.gradients.borderLight.main,
                palette.gradients.borderLight.state,
                palette.gradients.borderLight.angle
              )}
            >
              <VuiBox display="flex" alignItems="center" position="relative">
                <VuiInput
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  sx={{ cursor: "pointer", zIndex: 10 }}
                  onClick={toggleConfirmPasswordVisibility}
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

          <VuiBox display="flex" alignItems="center">
            <VuiSwitch 
              color="info" 
              checked={agreeTerms} 
              onChange={() => setAgreeTerms(!agreeTerms)}
              inputProps={{ "aria-label": "I agree to the Terms and Conditions" }}
            />
            <VuiTypography
              variant="caption"
              color="white"
              fontWeight="medium"
              onClick={() => setAgreeTerms(!agreeTerms)}
              sx={{ cursor: "pointer", userSelect: "none" }}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;I agree to the Terms and Conditions
            </VuiTypography>
          </VuiBox>

          <VuiBox mt={4} mb={1}>
            <VuiButton type="submit" color="info" fullWidth disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </VuiButton>
          </VuiBox>

          <VuiBox mt={2} mb={1} textAlign="center">
            <VuiTypography variant="button" color="text" fontWeight="regular">
              OR
            </VuiTypography>
          </VuiBox>

          <VuiBox mt={2} mb={1}>
            <VuiButton
              color="white"
              fullWidth
              onClick={handleGoogleSignUp}
              sx={{
                color: "#344767",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <VuiBox component="img" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20px" mr={1} />
              Continue with Google
            </VuiButton>
          </VuiBox>

          <VuiBox mt={2} mb={1}>
            <VuiButton
              color="dark"
              fullWidth
              onClick={handleGithubSignUp}
              sx={{
                backgroundColor: "#24292e",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1a1e22",
                },
              }}
            >
              <VuiBox component="img" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="20px" mr={1} />
              Continue with GitHub
            </VuiButton>
          </VuiBox>

          <VuiBox mt={3} textAlign="center">
            <VuiTypography variant="button" color="text" fontWeight="regular">
              Already have an account?{" "}
              <VuiTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="white"
                fontWeight="medium"
              >
                Sign in
              </VuiTypography>
            </VuiTypography>
          </VuiBox>
        </VuiBox>
      ) : (
        <VuiBox component="form" role="form" onSubmit={handleVerify} noValidate>
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
              <VuiTypography component="label" variant="button" color="white" fontWeight="medium">
                Verification Code
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
                type="text"
                placeholder="Enter 6-digit code..."
                fontWeight="500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ required: false }}
              />
            </GradientBorder>
          </VuiBox>

          <VuiBox mt={4} mb={1}>
            <VuiButton type="submit" color="info" fullWidth disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY EMAIL"}
            </VuiButton>
          </VuiBox>

          <VuiBox mt={2} mb={1}>
            <VuiButton color="secondary" fullWidth onClick={handleResendCode} disabled={loading}>
              RESEND CODE
            </VuiButton>
          </VuiBox>

          <VuiBox mt={3} textAlign="center">
            <VuiTypography variant="button" color="text" fontWeight="regular">
              Wrong email?{" "}
              <VuiTypography
                component="span"
                variant="button"
                color="white"
                fontWeight="medium"
                onClick={() => setShowVerification(false)}
                sx={{ cursor: "pointer" }}
              >
                Go back
              </VuiTypography>
            </VuiTypography>
          </VuiBox>
        </VuiBox>
      )}
    </CoverLayout>
  );
}

export default SignUp;
