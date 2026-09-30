interface DashboardSectionHeaderProps {

    title: string;

    description?: string;

}


export function DashboardSectionHeader({

                                           title,

                                           description

                                       }: DashboardSectionHeaderProps) {

    return (

        <div className="dashboard-section-header">

            <div>

                <h2>
                    {title}
                </h2>


                {
                    description && (

                        <p>
                            {description}
                        </p>

                    )
                }

            </div>

        </div>

    );

}