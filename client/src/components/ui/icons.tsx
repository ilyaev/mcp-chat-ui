import React from "react";

export const SpinnerIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loading"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="#888"
      strokeWidth="4"
      opacity="0.2"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="#888"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export const CheckmarkIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Success"
  >
    <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.015" />
    <path
      d="M7 12.5l3.5 3L17 9"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const CalendarIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Calendar"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="3"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <path d="M3 9h18" stroke="#888" strokeWidth="2" />
    <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#888" />
    <rect x="11" y="13" width="2" height="2" rx="0.5" fill="#888" />
    <rect x="15" y="13" width="2" height="2" rx="0.5" fill="#888" />
  </svg>
);

export const EntityIdIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Entity ID"
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="4"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="10"
      fill="#888"
      fontFamily="sans-serif"
    >
      ID
    </text>
  </svg>
);

export const EntityTypeIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Entity Type"
  >
    <circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="2" fill="none" />
    <rect
      x="8"
      y="8"
      width="8"
      height="8"
      rx="2"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const PromptIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Prompt"
  >
    <rect
      x="4"
      y="5"
      width="16"
      height="14"
      rx="3"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 9h8M8 13h5"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="17" r="2" fill="#888" />
  </svg>
);

export const DataFilterIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Data Filter"
  >
    <rect x="4" y="6" width="16" height="2" rx="1" fill="#888" />
    <rect x="7" y="11" width="10" height="2" rx="1" fill="#888" />
    <rect x="10" y="16" width="4" height="2" rx="1" fill="#888" />
  </svg>
);

export const TimezoneIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Timezone"
  >
    <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2" fill="none" />
    <path
      d="M12 6v6l4 2"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.24 7.76a6 6 0 1 1-8.48 8.48"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const SearchIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Search"
  >
    <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2" fill="none" />
    <line
      x1="16.5"
      y1="16.5"
      x2="21"
      y2="21"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ExpressionIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Expression"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="3"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <path d="M8 12h8" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M10.5 9.5l-2 2 2 2"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M13.5 14.5l2-2-2-2"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const LimitIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Limit"
  >
    <rect
      x="4"
      y="6"
      width="16"
      height="12"
      rx="3"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <path d="M8 12h8" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M16 12l-2 2m2-2l-2-2"
      stroke="#888"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OffsetIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Offset"
  >
    <rect
      x="4"
      y="6"
      width="16"
      height="12"
      rx="3"
      stroke="#888"
      strokeWidth="2"
      fill="none"
    />
    <path d="M8 12h8" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="12" r="1.5" stroke="#888" strokeWidth="2" fill="none" />
    <path d="M12 12h4" stroke="#888" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
