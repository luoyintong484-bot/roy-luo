import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[R7 Fortune] Caught by ErrorBoundary:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-sm w-full text-center border border-[#FFB6C115]">
            <h2 className="font-display text-xl font-bold text-[#f0e6d3] mb-2">Oops!</h2>
            <p className="text-sm text-[#8a8aad] mb-1">Something went wrong loading this page.</p>
            <p className="text-[10px] text-[#8a8aad44] mb-4">{this.state.error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
                className="px-5 py-2.5 bg-[#151520] border border-[#d4a85322] text-[#f0e6d3] rounded-lg text-sm font-medium hover:border-[#d4a85355] transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
                className="px-5 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-sm font-medium hover:bg-[#f0a0b8] transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
