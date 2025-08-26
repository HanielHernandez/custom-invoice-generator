declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number, number, number]
        filename?: string
        image?: { type?: string; quality?: number }
        html2canvas?: any
        jsPDF?: any
        pagebreak?: any
    }

    interface Html2PdfInstance {
        set: (options: Html2PdfOptions) => Html2PdfInstance
        from: (element: HTMLElement | string) => Html2PdfInstance
        toPdf: () => Html2PdfInstance
        outputPdf: (
            type: 'blob' | 'datauristring' | 'arraybuffer'
        ) => Promise<Blob | string | ArrayBuffer>
        save: () => Promise<void>
    }

    function html2pdf(): Html2PdfInstance
    export = html2pdf
}
