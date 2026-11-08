import React, { useRef } from 'react';
import Webcam from 'react-webcam';

interface Props {
    capturedImage: string | null;
    loading: boolean;
    onCapture: (imageSrc: string) => void;
    onRetake: () => void;
    onAnalyze: () => void;
}

export const CameraScanner: React.FC<Props> = ({capturedImage, loading, onCapture, onRetake, onAnalyze,}) => {

    const webcamRef = useRef<Webcam>(null);
    const handleCapture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) onCapture(imageSrc);
        }
    };

    // @ts-ignore
    return (
        <div className="camera-box">
            {!capturedImage ? (
                <>
                    <h3>Take Photo of Meal</h3>
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" //Zoe reduced image scale
                            screenshotQuality={0.7}
                            forceScreenshotSourceSize={false}
                            videoConstraints={{
                                width: { ideal: 1024 },
                                height: { ideal: 768 },
                                facingMode: "environment"
                            }} //end of what zoe added.
                            width="100%" />
                    <button onClick={handleCapture} className="primary-btn" style={{ marginTop: 10 }}>
                        Capture
                    </button>
                </>
            ) : (
                <>
                    <img src={capturedImage} alt="Captured meal" style={{ width: '100%', borderRadius: 8 }} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                        <button onClick={onRetake}>Retake</button>
                        <button onClick={onAnalyze} disabled={loading} className="primary-btn">
                            {loading ? 'Analyzing with AI...' : 'Process Photo'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};