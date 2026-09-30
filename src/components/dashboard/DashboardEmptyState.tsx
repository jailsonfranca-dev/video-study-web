import {
    Link
} from 'react-router-dom';


interface DashboardEmptyStateProps {

    icon?: string;

    title: string;

    description: string;

    actionLabel?: string;

    actionTo?: string;

}


export function DashboardEmptyState({

                                        icon = '📚',

                                        title,

                                        description,

                                        actionLabel,

                                        actionTo

                                    }: DashboardEmptyStateProps) {

    return (

        <div className="dashboard-empty-state">

            <div className="dashboard-empty-state-icon">
                {icon}
            </div>


            <h3>
                {title}
            </h3>


            <p>
                {description}
            </p>


            {
                actionLabel &&
                actionTo && (

                    <Link
                        to={
                            actionTo
                        }
                        className="dashboard-empty-state-action"
                    >
                        {actionLabel}
                    </Link>

                )
            }

        </div>

    );

}