// Material UI
import Typography from "@mui/material/Typography";

type Props = {
  title: string;
}

const MainTitle = ({title}: Props) => {
  return (
    <Typography variant="h6" sx={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--primary-color)" }}>
      {title}
    </Typography>
  )
}

export default MainTitle;