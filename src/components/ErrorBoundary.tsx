import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface Props { children: ReactNode; fallbackMessage?: string; }
interface State { hasError: boolean; error: string | null; errorCount: number; }

export default class ErrorBoundary extends Component<Props, State> {
  private bfcacheHandler: ((e: PageTransitionEvent) => void) | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[R7 Fortune] ErrorBoundary caught:", error.message, error.stack?.slice(0, 200));
  }

  componentDidMount() {
    // Safari bfcache: if page restores with an error state, auto-retry once
    this.bfcacheHandler = (e: PageTransitionEvent) => {
      if (e.persisted && this.state.hasError && this.state.errorCount < 2) {
        this.setState({ hasError: false, error: null, errorCount: this.state.errorCount + 1 });
      }
    };
    window.addEventListener("pageshow", this.bfcacheHandler);
  }

  componentWillUnmount() {
    if (this.bfcacheHandler) {
      window.removeEventListener("pageshow", this.bfcacheHandler);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null });
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/#/";
  };

  handleGoHome = () => {
    window.location.href = "/#/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-sm w-full text-center border border-[#FFB6C115] space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-400/10 flex items-center justify-center mx-auto border border-rose-400/20">
              <AlertTriangle className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#f0e6d3] mb-1">
                {this.props.fallbackMessage || "页面加载异常"}
              </h2>
              <p className="text-xs text-[#8a8aad] mb-2">Something went wrong. Please try again.</p>
              <p className="text-[9px] text-[#8a8aad44] bg-[#151520] rounded-lg px-3 py-2 break-all font-mono">
                {this.state.error}
              </p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-xs font-bold hover:bg-[#f0a0b8] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重试
              </button>
              <button
                onClick={this.handleGoBack}
                className="px-4 py-2.5 bg-[#151520] border border-[#d4a85322] text-[#f0e6d3] rounded-lg text-xs font-medium hover:border-[#d4a85355] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 bg-[#151520] border border-[#FFB6C115] text-[#8a8aad] rounded-lg text-xs font-medium hover:border-[#FFB6C133] hover:text-[#f0e6d3] transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                首页
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
