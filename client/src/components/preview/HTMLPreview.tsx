import React, { Component, createRef } from "react";

interface HTMLPreviewProps {
  children: React.ReactNode;
  index: number;
  height?: number;
  title?: string;
}

class HTMLPreview extends Component<HTMLPreviewProps> {
  iframeRef = createRef<HTMLIFrameElement>();

  constructor(props: HTMLPreviewProps) {
    super(props);
  }

  componentDidMount() {
    this.sendContentToIframe();
  }

  componentDidUpdate(prevProps: HTMLPreviewProps) {
    if (prevProps.children !== this.props.children) {
      this.sendContentToIframe();
    }
  }

  sendContentToIframe() {
    const content =
      typeof this.props.children === "string"
        ? this.props.children
        : (
            React.Children.map(this.props.children, (child) =>
              typeof child === "string" ? child : ""
            ) || []
          ).join("");

    // Remove any previous form
    const oldForm = document.getElementById("html-preview-form");
    if (oldForm) {
      oldForm.remove();
    }

    // Create a hidden form targeting the iframe
    const form = document.createElement("form");
    form.style.display = "none";
    form.id = "html-preview-form";
    form.method = "POST";
    form.action = "http://localhost:3000/webserver"; // Adjust as needed

    // Use iframeRef to set the target
    if (this.iframeRef.current) {
      form.target = this.iframeRef.current.name;
    } else {
      form.target = "html-preview-iframe";
    }

    const input = document.createElement("textarea");
    input.name = "html";
    input.value = content.replace("```html", "").replace("```", "");

    input.value = this.injectErrorTracker(input.value);

    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    // No need to update previewUrl, iframe will load the response
  }

  injectErrorTracker(html: string) {
    // Inject error tracking script
    const errorTrackingScript = `
      <script>
        origin = "${window.location.origin}"
        window.onerror = function(message, source, lineno, colno, error) {
          error = "Message: " + message;
          error += " ; Line: " + lineno;
          error += " ; Column: " + colno;
          window.parent.postMessage({ type: "error-tracking", error: error, index: ${this.props.index} }, origin);
        };
        window.onunhandledrejection = function(event) {
          const error = "Message: " + event.reason;
          window.parent.postMessage({ type: "error-tracking", error: error, index: ${this.props.index} }, origin);
        };
        window.onuncaughtexception = function(error) {
          window.parent.postMessage({ type: "error-tracking", error: error.message, index: ${this.props.index} }, origin);
        };
      </script>
    `;
    return errorTrackingScript + html;
  }

  render() {
    return (
      <iframe
        ref={this.iframeRef}
        name={`html-preview-iframe_${this.props.index}`}
        title="HTML Preview"
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: "1024px",
          height: `${this.props.height || 768}px`,
          border: "none",
        }}
      />
    );
  }
}

export default HTMLPreview;
