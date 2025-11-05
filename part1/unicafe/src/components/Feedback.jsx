export const Feedback = ({good, setGood, bad, setBad, neutral, setNeutral}) => {
    return (
        <div>
            <h1>give feedback</h1>
            <div>
                <button onClick={() => setGood(good + 1)}>good</button>
                <button onClick={() => setNeutral(neutral + 1)}>neutral</button>
                <button onClick={() => setBad(bad + 1)}>bad</button>
            </div>
        </div>
    )
}