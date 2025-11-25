import './styles.css'

export const Notification = ({ isSuccess,message }) => {
  if (message === "") {
    return null
  }

  return (
    <div className={`notification ${isSuccess ? "success" : "error"}`}>
      {message}
    </div>
  )
}