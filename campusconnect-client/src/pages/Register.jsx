import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Formik } from "formik";
import * as yup from "yup";
import {
  Box, TextField, Button, Typography, Alert, Link, Collapse,
  ToggleButton, ToggleButtonGroup, IconButton, InputAdornment,
} from "@mui/material";
import { School, Work, Code, PersonAddAlt1, Visibility, VisibilityOff } from "@mui/icons-material";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import { registerUser } from "../services/authService";
import { getErrorMessage } from "../services/api";
import { ROLE_COLORS } from "../theme";

const schema = yup.object().shape({
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup.string().email("Enter a valid email").required("Required"),
  password: yup.string().min(6, "At least 6 characters").required("Required"),
  role: yup.string().oneOf(["student", "alumni", "developer"]).required("Required"),
});

const ROLE_OPTIONS = [
  { value: "student", label: "Student", Icon: School },
  { value: "alumni", label: "Alumni", Icon: Work },
  { value: "developer", label: "Developer", Icon: Code },
];

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(values, { setSubmitting }) {
    setServerError("");
    try {
      await registerUser(values);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Create your account</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Join your academic community</Typography>

      <Formik
        initialValues={{ firstName: "", lastName: "", email: "", password: "", role: "student" }}
        validationSchema={schema} onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField label="First Name" name="firstName" value={values.firstName} onChange={handleChange} onBlur={handleBlur}
                error={!!touched.firstName && !!errors.firstName} helperText={touched.firstName && errors.firstName} />
              <TextField label="Last Name" name="lastName" value={values.lastName} onChange={handleChange} onBlur={handleBlur}
                error={!!touched.lastName && !!errors.lastName} helperText={touched.lastName && errors.lastName} />
            </Box>
            <TextField fullWidth margin="normal" label="Email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
              error={!!touched.email && !!errors.email} helperText={touched.email && errors.email} />
            <TextField
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
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

            <Typography variant="caption" color="text.secondary" display="block" mt={2} mb={1} fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
              I am a
            </Typography>
            <ToggleButtonGroup
              fullWidth exclusive value={values.role}
              onChange={(e, val) => val && handleChange({ target: { name: "role", value: val } })}
              sx={{ gap: 1 }}
            >
              {ROLE_OPTIONS.map(({ value, label, Icon }) => {
                const active = values.role === value;
                const color = ROLE_COLORS[value];
                return (
                  <ToggleButton
                    key={value} value={value}
                    sx={{
                      flexDirection: "column", gap: 0.5, py: 1.5, border: "1.5px solid", borderRadius: "10px !important",
                      borderColor: active ? color : "divider",
                      bgcolor: active ? `${color}1A` : "transparent",
                      color: active ? color : "text.secondary",
                      "&.Mui-selected": { bgcolor: `${color}1A`, color, "&:hover": { bgcolor: `${color}22` } },
                    }}
                  >
                    <Icon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>{label}</Typography>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>

            <Collapse in={!!serverError} sx={{ mt: serverError ? 2 : 0 }}>
              <Alert severity="error" onClose={() => setServerError("")}>{serverError}</Alert>
            </Collapse>
            <Collapse in={success} sx={{ mt: success ? 2 : 0 }}>
              <Alert severity="success">Account created — redirecting to login…</Alert>
            </Collapse>

            <Button
              fullWidth type="submit" variant="contained" size="large" disabled={isSubmitting || success}
              startIcon={<PersonAddAlt1 />} sx={{ mt: 3, py: 1.3 }}
            >
              Create Account
            </Button>
          </form>
        )}
      </Formik>

      <Typography variant="body2" mt={3} textAlign="center" color="text.secondary">
        Already have an account? <Link component={RouterLink} to="/login" fontWeight={600}>Log in</Link>
      </Typography>
    </AuthLayout>
  );
}
