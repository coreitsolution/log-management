import React from 'react'
import { useForm } from "react-hook-form";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

// Components
import TextBox from "../components/text-box/TextBox";

interface FormData {
  username: string;
  password: string;
}

type Props = {}

const Login = (props: Props) => {

  // Form Data
  const [formData, setFormData] = React.useState<FormData>({
    username: "",
    password: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleFormSubmit = (data: any) => {
    alert("Login");
  };

  return (
    <section id='login'>
      <Box className="w-screen h-screen flex items-center justify-center bg-(--primary-color)">
        <Box className="flex flex-col items-center justify-center w-[25vw] h-[60vh] bg-(--secondary-color) rounded-[15px] gap-4">
          <img src="/icons/logo.png" alt="Logo" className='w-30 h-30' />
          <Box className="flex flex-col items-center justify-center">
            <Typography sx={{ fontSize: "18px", fontWeight: 700 }} variant='h6' color='var(--primary-color)'>
              {"ศูนย์สกัดกั้นการลำเลียงยาเสพติด"}
            </Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, mt: "-5px" }} variant='h6' color='var(--primary-color)'>
              {"กองบัญชาการตำรวจปราบปรามยาเสพติด"}
            </Typography>
          </Box>
          <Box className="py-4 px-10 w-full">
            <form className='flex flex-col gap-4 w-full' onSubmit={handleSubmit(handleFormSubmit)}>
              <Box className="w-full h-15.75">
                <TextBox
                  sx={{ fontSize: "15px" }}
                  id="username"
                  label={""}
                  placeholder={"หมายเลขบัตรประชาชน"}
                  labelFontSize="16px"
                  minHeight='40px'
                  value={formData.username}
                  onChange={(event) =>
                    handleTextChange("username", event.target.value)
                  }
                  register={register("username", {
                    required: true,
                  })}
                  helperText={!!errors.username ? "กรุณากรอกหมายเลขบัตรประชาชน" : ""}
                  error={!!errors.username}
                />
              </Box>
              <Box className="w-full h-15.75 -mt-2.5">
                <TextBox
                  sx={{ fontSize: "15px" }}
                  id="password"
                  label={""}
                  placeholder={"รหัสผ่าน"}
                  labelFontSize="16px"
                  minHeight='40px'
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    handleTextChange("password", event.target.value)
                  }
                  register={register("password", {
                    required: true,
                  })}
                  helperText={!!errors.password ? "กรุณากรอกรหัสผ่าน" : ""}
                  error={!!errors.password}
                />
              </Box>
              <Button
                variant="contained"
                type='submit'
                sx={{
                  backgroundColor: "var(--primary-color)",
                  fontSize: "16px",
                  width: "100%",
                  height: "50px",
                  borderRadius: "5px",
                  mt: "15px",
                }}
              >
                เข้าสู่ระบบ
              </Button> 
            </form>
          </Box>
        </Box>
      </Box>
    </section>
  )
}

export default Login;