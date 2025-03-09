import { observer } from "mobx-react-lite";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { TextInput, PasswordInput, Button, Paper, Title, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import authStore from "../../stores/authStore";
import { IconAlertCircle } from '@tabler/icons-react';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  
  // Redirect to claims page if already authenticated
  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate('/claims');
    }
  }, [authStore.isAuthenticated, navigate]);
  
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await authStore.login(values.username, values.password);
    if (authStore.isAuthenticated) {
      navigate('/claims');
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="w-full max-w-md px-4">
        <Paper shadow="md" p="xl" withBorder className="w-full">
          <Title c="#00dd7c" order={2} className="mb-6 text-center">Clearest Health</Title>
          
          {authStore.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" className="mb-4">
              {authStore.error}
            </Alert>
          )}
          
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              className="mb-3"
              required
              {...form.getInputProps('username')}
            />
            
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              className="mb-5"
              required
              {...form.getInputProps('password')}
            />
            
            <Button 
              color="#00dd7c" 
              fullWidth 
              type="submit"
              loading={authStore.isLoading}
            >
              Log in
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              Use any username and password "password" to log in
            </div>
          </form>
        </Paper>
      </div>
    </div>
  );
});

export default LoginPage; 