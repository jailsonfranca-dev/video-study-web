import {
    useState
} from 'react';

import type {
    Flashcard
} from '../../types/studyMaterial';


interface StudyFlashcardsProps {
    flashcards: Flashcard[];
}


export function StudyFlashcards({
                                    flashcards
                                }: StudyFlashcardsProps) {

    const [
        revealed,
        setRevealed
    ] =
        useState<Set<string>>(
            new Set()
        );


    function toggleAnswer(
        id: string
    ) {

        setRevealed(
            current => {

                const next =
                    new Set(
                        current
                    );


                if (
                    next.has(
                        id
                    )
                ) {

                    next.delete(
                        id
                    );

                } else {

                    next.add(
                        id
                    );

                }


                return next;
            }
        );

    }


    return (
        <div className="study-flashcards">

            {flashcards.map(
                flashcard => {

                    const isRevealed =
                        revealed.has(
                            flashcard.id
                        );


                    return (
                        <article
                            key={
                                flashcard.id
                            }
                            className="study-flashcard"
                        >

                            <span className="flashcard-number">
                                {flashcard.position}
                                /
                                {flashcards.length}
                            </span>


                            <h3>
                                {flashcard.question}
                            </h3>


                            {isRevealed && (

                                <div className="flashcard-answer">

                                    <strong>
                                        Resposta
                                    </strong>

                                    <p>
                                        {flashcard.answer}
                                    </p>

                                </div>

                            )}


                            <button
                                type="button"
                                onClick={
                                    () =>
                                        toggleAnswer(
                                            flashcard.id
                                        )
                                }
                            >

                                {
                                    isRevealed
                                        ? 'Ocultar resposta'
                                        : 'Mostrar resposta'
                                }

                            </button>

                        </article>
                    );

                }
            )}

        </div>
    );
}