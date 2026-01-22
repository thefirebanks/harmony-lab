/**
 * Loading Screen Component
 * Shows during sample loading
 */

'use client';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export function LoadingScreen({ message = 'Loading...', progress }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-text-muted/20 border-t-accent rounded-full animate-spin" />
      
      {/* Message */}
      <p className="text-text-secondary">{message}</p>
      
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-48 h-2 bg-background-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
