import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Wallet } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  async function handleLogin() {
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) { alert(error.message); return; }
    navigate("/dashboard");
  }

  async function handleRegister() {
    setLoading(true);
    const { error } = await register(email, password);
    setLoading(false);
    if (error) { alert(error.message); return; }
    alert("Register berhasil! Silakan login.");
    setMode("login");
  }

  async function handleKeyDown(e) {
    if (e.key === "Enter") mode === "login" ? handleLogin() : handleRegister();
  }

  return (
    <div className="kp-login">
      <div className="kp-login__box">
        {/* Logo */}
        <div className="kp-login__logo">
          <div className="kp-login__icon">
            <Wallet size={22} color="#0f172a" strokeWidth={2.5} />
          </div>
          <div>
            <div className="kp-login__brand">KAS PINTAR</div>
            <div className="kp-login__sub">Aesthetic Personal Cashflow System</div>
          </div>
        </div>

        <h2>{mode === "login" ? "Selamat Datang" : "Buat Akun Baru"}</h2>
        <p style={{ marginBottom: "1.5rem" }}>
          {mode === "login"
            ? "Masuk ke dashboard keuangan Anda."
            : "Daftar untuk mulai mengelola cashflow Anda."}
        </p>

        <div className="kp-field" style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="kp-field" style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {mode === "login" ? (
          <>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="kp-btn kp-btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginBottom: "10px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Masuk..." : "Login"}
            </button>
            <button
              onClick={() => setMode("register")}
              className="kp-btn kp-btn--outline"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              Belum punya akun? Daftar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="kp-btn kp-btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginBottom: "10px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
            <button
              onClick={() => setMode("login")}
              className="kp-btn kp-btn--outline"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              Sudah punya akun? Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}