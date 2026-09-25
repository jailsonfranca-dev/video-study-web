import {
    Link
} from 'react-router-dom';


interface BreadcrumbItem {
    label: string;
    to?: string;
}


interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}


export function Breadcrumbs({
                                items
                            }: BreadcrumbsProps) {

    return (
        <nav
            className="breadcrumbs"
            aria-label="Navegação"
        >

            {
                items.map(
                    (
                        item,
                        index
                    ) => {

                        const last =
                            index ===
                            items.length - 1;


                        return (
                            <span
                                key={
                                    `${item.label}-${index}`
                                }
                                className="breadcrumb-item"
                            >

                                {
                                    !last &&
                                    item.to
                                        ? (
                                            <Link
                                                to={
                                                    item.to
                                                }
                                            >
                                                {
                                                    item.label
                                                }
                                            </Link>
                                        )
                                        : (
                                            <span>
                                                {
                                                    item.label
                                                }
                                            </span>
                                        )
                                }


                                {
                                    !last && (
                                        <span
                                            className="breadcrumb-separator"
                                        >
                                            /
                                        </span>
                                    )
                                }

                            </span>
                        );

                    }
                )
            }

        </nav>
    );
}