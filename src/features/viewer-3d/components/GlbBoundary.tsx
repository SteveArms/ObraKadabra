"use client";

import { Component, type ReactNode } from "react";

type GlbBoundaryProps = { onError: () => void; children: ReactNode };

// A missing or corrupt GLB must not break the viewer: report it and render nothing so the parent can fall back
export class GlbBoundary extends Component<GlbBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
