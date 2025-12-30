-- Función para actualizar el rol de un usuario
-- Solo puede ser ejecutada por administradores

CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Obtener el rol del usuario actual
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Verificar que el usuario actual sea admin
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Solo los administradores pueden cambiar roles de usuarios';
  END IF;
  
  -- Verificar que el nuevo rol sea válido
  IF new_role NOT IN ('client', 'seller', 'admin') THEN
    RAISE EXCEPTION 'Rol inválido. Debe ser: client, seller o admin';
  END IF;
  
  -- Actualizar el rol
  UPDATE profiles
  SET role = new_role
  WHERE id = target_user_id;
  
  -- Verificar que se actualizó
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;
END;
$$;

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION update_user_role(UUID, TEXT) TO authenticated;

-- Comentario de la función
COMMENT ON FUNCTION update_user_role IS 'Permite a los administradores actualizar el rol de cualquier usuario';
