export const useRequests = () => {
  const get = async (path: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })

    return response.json()
  }

  const post = async (path: string, body: object) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify(body)
    })

    return response.json()
  }

  return { get, post }
}
