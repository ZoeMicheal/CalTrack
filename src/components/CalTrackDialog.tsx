import { useEffect, useState } from 'react';
import './CalTrackDialog.css';

type DialogType = 'alert' | 'confirm';

type DialogData = {
    message: string;
    type: DialogType;
    resolve: (result: boolean) => void;
};

let openDialog: ((dialog: DialogData) => void) | null = null;

export function caltrackAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
        if (!openDialog) {
            window.alert(message);
            resolve();
            return;
        }

        openDialog({
            message,
            type: 'alert',
            resolve: () => resolve(),
        });
    });
}

export function caltrackConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        if (!openDialog) {
            resolve(window.confirm(message));
            return;
        }

        openDialog({
            message,
            type: 'confirm',
            resolve,
        });
    });
}

export default function CalTrackDialog() {
    const [dialog, setDialog] = useState<DialogData | null>(null);

    useEffect(() => {
        openDialog = setDialog;
        return () => {
            openDialog = null;
        };
    }, []);

    const closeDialog = (result: boolean) => {
        dialog?.resolve(result);
        setDialog(null);
    };

    if (!dialog) return null;

    const isConfirm = dialog.type === 'confirm';

    return (
        <div className="caltrack-dialog-overlay">
            <div
                className="caltrack-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="caltrack-dialog-title"
                aria-describedby="caltrack-dialog-message"
            >
                <div className="caltrack-dialog-icon">
                    {isConfirm ? '🗑' : '!'}
                </div>

                <h2 id="caltrack-dialog-title">
                    {isConfirm ? 'Are You Sure?' : 'CalTrack Notice'}
                </h2>

                <p id="caltrack-dialog-message">
                    {dialog.message}
                </p>

                <div className="caltrack-dialog-actions">
                    {isConfirm && (
                        <button
                            type="button"
                            className="caltrack-dialog-cancel"
                            onClick={() => closeDialog(false)}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="button"
                        className="caltrack-dialog-primary"
                        onClick={() => closeDialog(true)}
                    >
                        {isConfirm ? 'Delete' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
