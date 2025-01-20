const CORS_PROXY = "https://cors-anywhere.herokuapp.com"
const BASE_URL = "https://share.shub.edu.vn/api/intern-test"

const fetchData = async () => {
    const response = await fetch(`${CORS_PROXY}/${BASE_URL}/input`, {
        headers: {
            'Origin': window.location.origin
        }
    }) 
    const data = await response.json()

    return data
}

const caculateData = async () => {
    const inputData  = await fetchData()
    const { data, query, token } = inputData

    const results = query.map(e => {
        const type = e.type
        const [l, r] = e.range

        if (type === "1"){
            return data.slice(l, r + 1).reduce((res, num) => {
                return res + num
            }, 0)
        } else {
            return data.slice(l, r + 1).reduce((res, num, index) => {
                return res + (index % 2 === 0 ? num : (-num))
            }, 0)
        }
    })

    return {
        array: results,
        token: token
    }
}

const process = async () => {
    const results = await caculateData()

    const response = await fetch(`${CORS_PROXY}/${BASE_URL}/output`, {
        method: 'POST',
        headers: {
            'Origin': window.location.origin,
            'Authorization': `Bearer ${results.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(results.array)
    })

    return {
        status: await response.json(),
        result: results.array
    }
}

const startProcess = async () => {
    try {
        document.getElementById('inputData').innerHTML = 'Loading...'
        document.getElementById('results').innerHTML = 'Processing...'
        
        const inputData = await fetchData()
        document.getElementById('inputData').innerHTML = JSON.stringify(inputData, null, 2)
        
        const {status, result} = await process()
        document.getElementById('results').innerHTML = `
            <div>
                <h4>Results Array:</h4>
                <pre>${JSON.stringify(result, null, 2)}</pre>
                
                <h4>Server Response:</h4>
                <pre><span class="success">Success!</span><br>${JSON.stringify(status, null, 2)}</pre>
            </div>
        `
    } catch (error) {
        document.getElementById('results').innerHTML = `<span class="error">Error: ${error.message}</span>`
    }
}

startProcess()