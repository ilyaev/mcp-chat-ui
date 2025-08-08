import React, { Component } from "react";
import type { ReactNode } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { setProfile } from "../../store/slices/profileSlice";
import { connect } from "react-redux";
import type { Dispatch } from "@reduxjs/toolkit";
import Config from "@/const";

const BASE_SERVER_URL =
  document.location.port === "5173" ? "http://localhost:3000" : "";
const GOOGLE_CLIENT_ID = Config.GOOGLE_CLIENT_ID;

const loadGoogleClient = () => {
  const scriptId = "google-identity-services";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    document.body.appendChild(script);
    return script;
  }
};

interface GoogleAuthProps {
  children: ReactNode;
  dispatch: Dispatch;
}

interface GoogleAuthState {
  idToken: string | null;
  loading: boolean;
  accountInfo: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
  autoLoginTried: boolean;
}

type TokenRefreshTimer = ReturnType<typeof setTimeout> | null;

class GoogleAuth extends Component<GoogleAuthProps, GoogleAuthState> {
  refreshTimer: TokenRefreshTimer = null;
  tokenExpiresAt: number | null = null;
  tokenClient: unknown = null;
  loginTries: number = 0;

  constructor(props: GoogleAuthProps) {
    super(props);
    this.state = {
      idToken: null,
      loading: true,
      accountInfo: null,
      autoLoginTried: false,
    };
    this.tryAutoLogin = this.tryAutoLogin.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.scheduleTokenRefresh = this.scheduleTokenRefresh.bind(this);
    this.clearTokenRefresh = this.clearTokenRefresh.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  componentDidMount() {
    const stored = localStorage.getItem("googleIdToken");
    if (stored) {
      this.verifyToken(stored);
    } else {
      if (!this.state.autoLoginTried) {
        this.setState({ autoLoginTried: true }, () => {
          const scriptId = "google-identity-services";
          if (!document.getElementById(scriptId)) {
            const script = loadGoogleClient();
            if (script) {
              script.onload = this.tryAutoLogin;
            }
          } else {
            this.tryAutoLogin();
          }
        });
      } else {
        this.setState({ loading: false });
      }
    }
  }

  componentWillUnmount() {
    this.clearTokenRefresh();
  }

  componentDidUpdate(_prevProps: GoogleAuthProps, prevState: GoogleAuthState) {
    // When accountInfo is set, update profile in redux
    if (
      this.state.accountInfo &&
      this.state.accountInfo.name &&
      this.state.accountInfo.email &&
      (this.state.accountInfo !== prevState.accountInfo ||
        this.state.idToken !== prevState.idToken)
    ) {
      this.props.dispatch(
        setProfile({
          name: this.state.accountInfo.name,
          email: this.state.accountInfo.email,
          picture: this.state.accountInfo.picture || "",
          googleIdToken: this.state.idToken || "",
          noAuth: false,
        })
      );
    }
    // If idToken changed, schedule refresh
    if (this.state.idToken && this.state.idToken !== prevState.idToken) {
      this.scheduleTokenRefresh(this.state.idToken);
    }
    // If logged out, clear refresh
    if (!this.state.idToken && prevState.idToken) {
      this.clearTokenRefresh();
    }
  }

  tryAutoLogin() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }): void => {
          if (response.credential) {
            this.setState({ loading: true });
            this.verifyToken(response.credential);
          } else {
            this.setState({ loading: false });
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.prompt(
        (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
        }) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.setState({ loading: false });
          }
        }
      );
    } else {
      setTimeout(this.tryAutoLogin, 50);
    }
  }

  verifyToken(token: string) {
    const payload = token.split(".")[1];
    let exp = null;
    if (payload) {
      try {
        const decoded = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        if (decoded.exp) {
          exp = decoded.exp * 1000;
          const now = Date.now();
          // If token expired or about to expire in 10s, refresh before validation
          if (exp - now < 10000) {
            this.refreshToken();
            return;
          }
        }
      } catch {
        // ignore decode errors, proceed to validation
      }
    }

    fetch(BASE_SERVER_URL + "/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          this.setState({ idToken: token });
          localStorage.setItem("googleIdToken", token);
          // Decode JWT to get account info and expiry
          const payload = token.split(".")[1];
          if (payload) {
            try {
              const decoded = JSON.parse(
                atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
              );
              this.setState({ accountInfo: decoded });
              // Set expiry for refresh
              if (decoded.exp) {
                this.tokenExpiresAt = decoded.exp * 1000;
                this.scheduleTokenRefresh(token);
              }
            } catch {
              this.setState({ accountInfo: null });
            }
          }
        } else {
          this.setState({ idToken: null, accountInfo: null, loading: false });
          localStorage.removeItem("googleIdToken");
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.loginTries += 1;
        if (this.loginTries < 3) {
          this.loginTries += 1;
          this.setState({ loading: true });
          setTimeout(() => {
            this.verifyToken(token);
          }, 2000);
        } else {
          this.setState({ idToken: null, accountInfo: null, loading: false });
          localStorage.removeItem("googleIdToken");
        }
      });
  }

  scheduleTokenRefresh(token: string) {
    this.clearTokenRefresh();
    // Decode expiry from token
    let exp = null;
    try {
      const payload = token.split(".")[1];
      if (payload) {
        const decoded = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        if (decoded.exp) {
          exp = decoded.exp * 1000;
        }
      }
    } catch {
      //
    }
    if (!exp) return;
    const now = Date.now();
    const msToExpiry = exp - now;
    // Refresh 1 minute before expiry, but not less than 10s from now
    const refreshIn = Math.max(msToExpiry - 60 * 1000, 10 * 1000);
    this.refreshTimer = setTimeout(this.refreshToken, refreshIn);
    this.tokenExpiresAt = exp;
  }

  clearTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.tokenExpiresAt = null;
  }

  refreshToken() {
    // Use Google Identity Services to get a new token
    if (!window.google) {
      loadGoogleClient();
    }
    if (window.google && window.google.accounts && window.google.accounts.id) {
      // Use prompt with auto_select to refresh silently
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }): void => {
          if (response.credential) {
            this.setState({ loading: true });
            this.verifyToken(response.credential);
          } else {
            // If failed, force logout
            this.handleLogout();
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.prompt(
        (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
        }) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If refresh fails, force logout
            this.handleLogout();
          }
        }
      );
    } else {
      // If GIS not loaded, try again soon
      setTimeout(this.refreshToken, 1000);
    }
  }

  handleLogin(token: string) {
    this.setState({ loading: true });
    this.verifyToken(token);
  }

  handleLogout() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.cancel();
    }
    this.clearTokenRefresh();
    this.setState({ idToken: null });
    localStorage.removeItem("googleIdToken");
    this.setState({ accountInfo: null });
    this.props.dispatch(
      setProfile({
        name: "",
        email: "",
        picture: "",
        googleIdToken: "",
        noAuth: false,
      })
    );
  }

  render() {
    const { loading, idToken, accountInfo } = this.state;
    const { children } = this.props;
    if (loading) {
      return (
        <div style={{ textAlign: "center", marginTop: "30vh" }}>Loading...</div>
      );
    }
    if (!idToken) {
      return <GoogleLogin onLogin={this.handleLogin} />;
    }
    return (
      <>
        {typeof children === "object"
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            React.cloneElement(children as any, {
              handleLogout: this.handleLogout,
              googleIdToken: idToken,
              googleAccountProfile: accountInfo,
            })
          : children}
      </>
    );
  }
}

class GoogleLogin extends Component<{ onLogin: (token: string) => void }> {
  componentDidMount() {
    loadGoogleClient();
    this.renderButton();
  }

  renderButton = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }): void => {
          if (response.credential) {
            this.props.onLogin(response.credential);
          }
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        {
          theme: document.documentElement.classList.contains("dark")
            ? "filled_black"
            : "",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 240,
        }
      );
    } else {
      setTimeout(this.renderButton, 50);
    }
  };

  render() {
    return (
      <Card className="absolute left-1/2 top-1/2 w-[20vw] h-[18vh] -translate-x-1/2 -translate-y-1/2  p-6 border-1 flex flex-col items-center justify-center">
        <CardTitle className="text-2xl">Chat MCP</CardTitle>
        <CardContent className="flex flex-col items-center justify-center">
          <div id="google-signin-btn" />
        </CardContent>
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({ dispatch });
const ConnectedGoogleAuth = connect(null, mapDispatchToProps)(GoogleAuth);
export { ConnectedGoogleAuth as GoogleAuth };
