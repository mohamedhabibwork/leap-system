export function NotFoundIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
      <path
        d="M100 60C83.43 60 70 73.43 70 90C70 106.57 83.43 120 100 120C116.57 120 130 106.57 130 90C130 73.43 116.57 60 100 60Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="90" cy="85" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="110" cy="85" r="5" fill="currentColor" opacity="0.5" />
      <path
        d="M85 105C85 105 90 110 100 110C110 110 115 105 115 105"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function ServerErrorIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="50" y="60" width="100" height="80" rx="8" fill="currentColor" opacity="0.1" />
      <rect x="60" y="75" width="80" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="60" y="95" width="60" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="60" y="115" width="70" height="10" rx="2" fill="currentColor" opacity="0.2" />
      <path
        d="M85 30L100 45L115 30"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      <circle cx="100" cy="165" r="8" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function ForbiddenIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="8" opacity="0.2" />
      <line
        x1="60"
        y1="60"
        x2="140"
        y2="140"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.3"
      />
      <rect x="80" y="90" width="40" height="50" rx="4" fill="currentColor" opacity="0.1" />
      <rect x="85" y="75" width="30" height="20" rx="8" fill="currentColor" opacity="0.2" />
      <circle cx="100" cy="110" r="4" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function UnauthorizedIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="80" r="30" fill="currentColor" opacity="0.1" />
      <path
        d="M70 130C70 116.193 81.1929 105 95 105H105C118.807 105 130 116.193 130 130V150H70V130Z"
        fill="currentColor"
        opacity="0.1"
      />
      <rect x="85" y="130" width="30" height="35" rx="4" fill="currentColor" opacity="0.2" />
      <circle cx="100" cy="147" r="5" fill="currentColor" opacity="0.4" />
      <rect x="97" y="147" width="6" height="12" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function ServiceUnavailableIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="70" fill="currentColor" opacity="0.05" />
      <path
        d="M100 50L110 80H130L114 92L120 120L100 105L80 120L86 92L70 80H90L100 50Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="100" cy="100" r="35" stroke="currentColor" strokeWidth="4" opacity="0.2" />
      <path
        d="M100 85V100L110 110"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

export function BadRequestIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`w-64 h-64 ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="60" y="50" width="80" height="100" rx="8" fill="currentColor" opacity="0.1" />
      <rect x="70" y="65" width="60" height="8" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="70" y="83" width="50" height="8" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="70" y="101" width="55" height="8" rx="2" fill="currentColor" opacity="0.2" />
      <circle cx="100" cy="130" r="15" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path
        d="M100 120V130M100 135V137"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
