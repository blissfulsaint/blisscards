import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Edit Cards'
}

export default function EditLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}