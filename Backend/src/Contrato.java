public class Contrato {
    private String nome;
    private int matricula;

    public Contrato(String nome, int matricula){
        setNome(nome);
        setMatricula(matricula);
    }
    
    public String getNome(){
        return nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public int getMatricula(){
        return matricula;
    }
    public void setMatricula(int matricula){
        this.matricula = matricula;
    }
    
}
