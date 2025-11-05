export const Total = ({ course }) => {
    const { parts } = course
    return <p>Number of exercises {parts[0].exercises + parts[1].exercises + parts[2].exercises}</p>;
};
