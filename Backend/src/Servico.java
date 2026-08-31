public class Servico {
    private int codigo;
    private String categoria;
    private String nome;
    private String descricao;
    
    public Servico(int codigo, String categoria, String nome, String descricao){
        setCodigo(codigo);
        setCategoria(categoria);
        setNome(nome);
        setDescricao(descricao);
    }

    public int getCodigo(){
        return codigo;
    }
    public void setCodigo(int codigo){
        this.codigo = codigo;
    }

    public String getCategoria(){
        return categoria;
    }
    public void setCategoria(String categoria){
        this.categoria = categoria;
    }

    public String getNome(){
        return nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public String getDescricao(){
        return descricao;
    }
    public void setDescricao(String descricao){
        this.descricao = descricao;
    }

}
