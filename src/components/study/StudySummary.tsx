import Markdown from 'react-markdown';


interface StudySummaryProps {
    summary: string;
}


export function StudySummary({
                                 summary
                             }: StudySummaryProps) {

    return (
        <div className="study-summary">
            <Markdown>
                {summary}
            </Markdown>
        </div>
    );
}