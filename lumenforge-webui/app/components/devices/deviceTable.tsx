// components/ProductsTable.tsx
import * as React from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export type DeviceRow = {
  id: string;
  name: string;
  category: string;
  brand: string;
  color: string;
  stock: number;
  price: number; // number, format in UI
};

type DeviceTableProps = {
  rows: DeviceRow[];
  search: string;
  onSearchChange: (value: string) => void;

  onAdd: () => void;
  onFilter: () => void;

  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;

  // optional: selection support
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
};

function formatMoney(value: number) {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function DeviceTable(props: DeviceTableProps) {
  const {
    rows,
    search,
    onSearchChange,
    onAdd,
    onFilter,
    onView,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelect,
  } = props;

  const [actionsAnchor, setActionsAnchor] = React.useState<null | HTMLElement>(null);
  const actionsOpen = Boolean(actionsAnchor);

  const isSelected = (id: string) => (selectedIds ? selectedIds.includes(id) : false);

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <Toolbar sx={{ gap: 1.5, p: 2 }}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products"
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Add Product
        </Button>

        <Button
          variant="outlined"
          startIcon={<FilterAltOutlinedIcon />}
          onClick={onFilter}
          sx={{ whiteSpace: "nowrap" }}
        >
          Filter Options
        </Button>

        <Button
          variant="outlined"
          endIcon={<MoreVertIcon />}
          onClick={(e) => setActionsAnchor(e.currentTarget)}
          sx={{ whiteSpace: "nowrap" }}
        >
          Actions
        </Button>

        <Menu anchorEl={actionsAnchor} open={actionsOpen} onClose={() => setActionsAnchor(null)}>
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              console.log("bulk export");
            }}
          >
            Export Selected
          </MenuItem>
          <MenuItem
            onClick={() => {
              setActionsAnchor(null);
              console.log("bulk delete");
            }}
          >
            Delete Selected
          </MenuItem>
        </Menu>
      </Toolbar>

      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell padding="checkbox" />
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Product Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Category
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Brand
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={700}>
                  Color
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={700}>
                  Stock
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={700}>
                  Price
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={700}>
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell padding="checkbox">
                  {onToggleSelect ? (
                    <input
                      type="checkbox"
                      checked={isSelected(r.id)}
                      onChange={() => onToggleSelect(r.id)}
                      aria-label={`Select ${r.name}`}
                    />
                  ) : null}
                </TableCell>

                <TableCell>
                  <Typography fontWeight={600}>{r.name}</Typography>
                </TableCell>

                <TableCell>{r.category}</TableCell>
                <TableCell>{r.brand}</TableCell>
                <TableCell>{r.color}</TableCell>

                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                    <Chip
                      size="small"
                      label={r.stock}
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                      }}
                    />
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: r.stock > 5 ? "success.main" : r.stock > 0 ? "warning.main" : "error.main",
                      }}
                    />
                  </Stack>
                </TableCell>

                <TableCell align="right">{formatMoney(r.price)}</TableCell>

                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => onView(r.id)}>
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(r.id)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => onDelete(r.id)}>
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ py: 6 }}>
                  <Typography align="center" color="text.secondary">
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
