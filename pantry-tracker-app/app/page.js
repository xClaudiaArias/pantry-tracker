"use client";

import { useState, useEffect } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { Firestore } from "firebase/firestore";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { app } from '@/firebase';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const firestore = getFirestore(app); // Initialize Firestore

  const updateInventory = async () => {
    try {
      const itemsCollection = collection(firestore, 'pantry'); // Access the "pantry" collection
      const querySnapshot = await getDocs(itemsCollection); // Fetch the documents
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(itemsList); // Check if itemsList is populated
      setInventory(itemsList); // Set the fetched items to state
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  // Button to add an item
  const addItem = async (item) => {
    if (!item) {
      console.error("Item name cannot be empty.");
      return;
    }
    
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
  
    await updateInventory();
  };

  // Button to remove an item
  const removeItem = async (item) => {
    if (!item) {
      console.error("Item name cannot be empty.");
      return;
    }
  
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    } 
  
    await updateInventory();
  };

  // Modal functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Filter inventory based on the search query
  const filteredInventory = inventory.filter(item => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={2}
    >

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant={"h6"} component={"h2"}>
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant='outlined' onClick={()=>{
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal> 
      {/* Modal end */}

      <Box 
        width={"55%"}
        display={"Flex"}
        justifyContent={"space-between"}
        alignItems={'center'}
      >
        <TextField 
          id="standard-basic" 
          label="Search" 
          variant="standard" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant={"contained"} onClick={handleOpen}>Add New Item</Button>
        {/* Search field */}
      </Box>

      {/* Wrapper box */}
      <Box border={'1px solid #325ca8'}>
        {/* Header box */}
        <Box width="800px" height="100px" backgroundColor={"#add8f6"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant={"h2"} fontWeight={"bold"} color={'#325ca8'}>
            Pantry Items
          </Typography>
        </Box>
        {/* Items */}
        <Stack width="800px" height="500px" spacing={2} overflow={"auto"}>
          {Array.isArray(filteredInventory) && filteredInventory.length > 0 ? (
            filteredInventory.map((item, i) => (
              <Box 
                key={i}
                width={"100%"}
                height={"100px"}
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                backgroundColor={"#f0f0f0"}
                padding={"0px 10px"}
              >
                <Button variant="outlined"  onClick={()=> addItem(item.id)}>
                  <AddIcon />
                </Button>
                <Typography
                  variant={'h3'}
                  color={'#325ca8'}
                  textAlign={'center'}
                >
                  {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                </Typography>

                <Typography variant={'h3'} color={'#333'} textAlign={'center'} fontWeight={"100"}>
                  Quantity: {item.quantity}
                </Typography>
                <Button variant="outlined" onClick={() => removeItem(item.id)}>
                  <DeleteOutlineIcon />
                </Button>
              </Box>
            ))
          ) : (
            <Typography variant="h6">No items found</Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
