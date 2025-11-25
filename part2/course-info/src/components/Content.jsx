import { Part } from "./Part";

export const Content = ({ course }) => {
    const { parts } = course;
    return (
        <div>
            {parts.map(p => <Part key={p.id} part={p} />)}
        </div>
    );
};
