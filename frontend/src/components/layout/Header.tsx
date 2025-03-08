import { observer } from "mobx-react-lite";
import { Group, Button, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import authStore from "../../stores/authStore";

const Header = observer(() => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };
  
  if (!authStore.isAuthenticated) {
    return null;
  }
  
  return (
    <div className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Text size="lg" c = "#00dd7c" fw={600}>Clearest Health</Text>
        
        <Group>
          <Text size="sm">Welcome, {authStore.username}</Text>
          <Button variant="subtle" color="gray" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </div>
    </div>
  );
});

export default Header; 