import { StatisticLine } from "./StatisticLine";

export const Statistics = ({ good, neutral, bad }) => {
    const all = good + neutral + bad;
    const average = (good - bad) / all;
    const positive = (good / all) * 100;
    return (
        <div>
            <h1>statistics</h1>
            {good || neutral || bad ? (
                <table>
                    <tbody>
                        <StatisticLine text="good" value={good} />
                        <StatisticLine text="neutral" value={neutral} />
                        <StatisticLine text="bad" value={bad} />
                        <StatisticLine text="all" value={all} />
                        <StatisticLine text="average" value={average} />
                        <StatisticLine text="positive" value={positive} />
                    </tbody>
                </table>
            ) : (
                <p>No feedback given</p>
            )}
        </div>
    );
};
