import { Link, useLocation } from 'react-router-dom';
import { Box, Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { mockdata } from '@/constants/mockdataLink';
import classes from './NavbarLink.module.css';

interface INavbarLinkProps {
  icon: React.FC<any>;
  label: string;
  link: string;
}

function SimpleNavbarLink({ icon: Icon, label, link }: INavbarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === link;

  return (
    <UnstyledButton
      component={Link}
      to={link}
      size="md"
      className={`${classes.control} ${isActive ? classes.active : ''}`}
    >
      <Group justify="space-between" gap={0}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeIcon variant="light" size={30}>
            <Icon size={18} />
          </ThemeIcon>

          <Text ml="md" fw={isActive ? 700 : 500}>
            {label}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
}

export function NavbarLink() {
  return (
    <>
      {mockdata.map((item, index) => (
        <SimpleNavbarLink key={index} icon={item.icon} label={item.label} link={item.link} />
      ))}
    </>
  );
}
