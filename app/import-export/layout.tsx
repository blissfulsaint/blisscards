import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Import/Export Cards'
}

export default function ImportExportLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}