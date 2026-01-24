import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Account Home'
}

export default function StudyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}