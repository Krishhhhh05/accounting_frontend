"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent) => {
    const WithAuthComponent = (props) => {
        const router = useRouter();

        useEffect(() => {
            const auth = localStorage.getItem('isAuthenticated');
            if (!auth) {
                router.push('/');
            }
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    // Add a display name for easier debugging
    WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithAuthComponent;
};

export default withAuth;
