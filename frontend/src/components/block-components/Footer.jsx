import React from "react";

function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>
                    © {new Date().getFullYear()} CodeItUp. A online coding
                    platform for DSA practice.
                </p>
            </footer>
        </>
    );
}

export default Footer;
