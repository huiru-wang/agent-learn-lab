import { PromptDocsPanel } from './components/prompt-docs-panel';

export default function PromptEngineeringPage() {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <PromptDocsPanel modulePath="/prompt-engineering" className="flex-1" />
        </div>
    );
}
