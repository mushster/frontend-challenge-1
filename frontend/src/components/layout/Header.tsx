import { observer } from "mobx-react-lite";
import { Group, Button, Text, Tabs } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import authStore from "../../stores/authStore";

const Header = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };
  
  if (!authStore.isAuthenticated) {
    return null;
  }

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/claims')) return 'claims';
    if (location.pathname.includes('/mrf-files')) return 'mrf-files';
    return null;
  };
  
  return (
    <div className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Text size="lg" c="#00dd7c" fw={600}>Clearest Health</Text>
          
          <Tabs value={getActiveTab()} onChange={(value) => navigate(`/${value}`)}>
            <Tabs.List>
              <Tabs.Tab value="claims">Claims Management</Tabs.Tab>
              <Tabs.Tab value="mrf-files">MRF Files</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </div>
        
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