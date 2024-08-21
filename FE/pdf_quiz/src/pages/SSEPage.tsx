import ClientSSE from '../Hooks/useSSE';
const SSEPage = () => {
    const { data, error } = ClientSSE(); 

    return (
        <div>
            <h1>SSE Data</h1>
            {error && <div>Error: {error.message}</div>}
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default SSEPage;
