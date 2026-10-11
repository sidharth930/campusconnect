import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import {
  Box, TextField, Button, Typography, Alert, Link, Collapse,
  IconButton, InputAdornment,
} from "@mui/material";
import {
  LoginOutlined, Visibility, VisibilityOff,
} from "@mui/icons-material";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import ForgotPasswordModal from "../components/ForgotPasswordModal/ForgotPasswordModal";
import { authStart, authSuccess, authFailure } from "../redux/authSlice";
import { loginUser } from "../services/authService";
import { getErrorMessage } from "../services/api";
import Loader from "../components/Loader/Loader";

const schema = yup.object().shape({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  async function handleSubmit(values) {
    setServerError("");
    dispatch(authStart());
    try {
      const data = await loginUser(values);
      dispatch(authSuccess(data));
      navigate("/home");
    } catch (err) {
      const msg = getErrorMessage(err);
      setServerError(msg);
      dispatch(authFailure(msg));
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Welcome back</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Log in to your CampusConnect account</Typography>

      <Formik initialValues={{ email: "", password: "" }} validationSchema={schema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" name="email" margin="normal" value={values.email} autoFocus
              onChange={handleChange} onBlur={handleBlur}
              error={!!touched.email && !!errors.email} helperText={touched.email && errors.email}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
              margin="normal"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <Box display="flex" justifyContent="flex-end" mt={0.5} mb={1}>
              <Link
                component="button"
                type="button"
                variant="caption"
                fontWeight={600}
                onClick={() => setForgotOpen(true)}
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Collapse in={!!resetSuccessMsg} sx={{ mt: resetSuccessMsg ? 1 : 0, mb: 1 }}>
              <Alert severity="success" onClose={() => setResetSuccessMsg("")}>{resetSuccessMsg}</Alert>
            </Collapse>

            <Collapse in={!!serverError} sx={{ mt: serverError ? 1 : 0 }}>
              <Alert severity="error" onClose={() => setServerError("")}>{serverError}</Alert>
            </Collapse>

            {loading ? <Loader /> : (
              <Button
                fullWidth type="submit" variant="contained" size="large"
                startIcon={<LoginOutlined />} sx={{ mt: 2.5, py: 1.3 }}
              >
                Log In
              </Button>
            )}

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
              open={forgotOpen}
              onClose={() => setForgotOpen(false)}
              defaultEmail={values.email}
              onPasswordReset={(resetEmail, resetPass) => {
                setFieldValue("email", resetEmail);
                setFieldValue("password", resetPass);
                setResetSuccessMsg("Password reset successfully! Ready to log in.");
              }}
            />
          </form>
        )}
      </Formik>

      <Typography variant="body2" mt={3} textAlign="center" color="text.secondary">
        Don't have an account? <Link component={RouterLink} to="/register" fontWeight={600}>Sign up</Link>
      </Typography>
    </AuthLayout>
  );
}
